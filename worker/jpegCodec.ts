/**
 * The JPEG codec of the Meteosat frame cache: MozJPEG as WebAssembly (@jsquash/jpeg).
 *
 * Why not jpeg-js, which the share card already uses: decoding one 2048 px piece of a frame with it peaks at about
 * 116 MB, against a Worker's 128 MB, and takes 424 ms; its encoder spends 25 ms building its tables for every picture,
 * however small. MozJPEG decodes the piece in 76 ms within about 40 MB, and encodes a 176 px picture in under 9 ms
 * (measured on a real piece, 2026-11-17). The decode runs four times a frame, the encode once per picture served, so
 * this is most of what the cache costs in CPU.
 *
 * Workers only run WebAssembly bundled at deploy time: worker/index.ts imports the two modules and hands them over.
 * Each is set up on its first use, so a request that needs neither pays for neither.
 */
import decode, { init as initDecode } from '@jsquash/jpeg/decode.js'
import encode, { init as initEncode } from '@jsquash/jpeg/encode.js'

/**
 * Quality 92 without chroma subsampling: a cut is the second JPEG pass a frame goes through (EUMETSAT's piece is the
 * first), so it is kept light. Plain baseline Huffman coding: the picture is 9 kB either way, and the slower modes
 * (progressive scans, optimised tables) cost CPU on every picture.
 */
const ENCODE = { quality: 92, baseline: true, progressive: false, optimize_coding: false, auto_subsample: false, chroma_subsample: 1 } as const

export interface JpegCodec {
  /** A JPEG to RGBA pixels, row 0 first */
  decode(jpeg: ArrayBuffer): Promise<{ data: Uint8ClampedArray; width: number; height: number }>
  /** RGBA pixels to a JPEG */
  encode(rgba: Uint8ClampedArray, width: number, height: number): Promise<ArrayBuffer>
}

export function jpegCodec(decoder: WebAssembly.Module, encoder: WebAssembly.Module): JpegCodec {
  let decoding: Promise<void> | undefined
  let encoding: Promise<void> | undefined
  return {
    async decode(jpeg) {
      await (decoding ??= initDecode(decoder))
      const img = await decode(jpeg)
      return { data: img.data, width: img.width, height: img.height }
    },
    async encode(rgba, width, height) {
      await (encoding ??= initEncode(encoder))
      // The codec reads data, width and height only: no ImageData is needed (Workers have none).
      return encode({ data: rgba, width, height } as ImageData, ENCODE)
    },
  }
}
