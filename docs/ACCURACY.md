# What the labels mean, and what Watched can't know

The exact rules behind every label and number in the app. The [README](../README.md) has the short version.

## What *watched* means

Every pass gets one of four labels, and only the first means an image exists. The line in italics is the rule behind
each one.

| Label | What it means |
|:--|:--|
| ◆&nbsp;**Watched** | A real image of this place exists in a public archive.<br>*A Sentinel-2, Landsat or weather photo, or a Sentinel-1 radar image, was matched to the pass. A VIIRS daily mosaic still unchecked after 2.5 s also counts, if the same satellite has a verified mosaic on a later day.* |
| ◇&nbsp;**Likely watched** | A fixed camera's swath covered this place. No photo of it is published.<br>*Sentinel-2 or Landsat in daylight, or a polar weather satellite, with no photo found.* |
| □&nbsp;**Could have pointed here** | A steerable or private camera was in range. Its operator doesn't say whether it looked.<br>*A commercial camera in daylight, or a radar satellite at any hour (for Sentinel-1, whose images are public: none of this pass shows the place).* |
| +&nbsp;**Passed overhead** | Crossed your sky, with no camera known to be recording this place.<br>*The ISS or Tiangong at least 10° above the horizon, or a Sentinel-2 or Landsat pass over open ocean (outside Sentinel-2's acquisition plan).* |

The results headline (*260 satellites watched Palm Jumeirah*) counts every satellite with at least one pass,
whatever its label, so *watched* there is meant broadly; only ◆ passes come with an image. The second line counts the
images that were made public (photos, weather mosaics and radar images alike), and starts with "At least" while
archives are still answering. Geostationary weather
satellites never pass; they sit over the equator all week, so they are listed separately and not counted among the
satellites. Their images are counted, though: every full-disc image that GOES, Himawari or a Meteosat took of the
place's side of the Earth that week (one every 10 or 15 minutes, about a thousand each) is in the second line's
number, and the newest of each is shown. The app says *watched*, never *photographed*.

## Accuracy and limits

- Passes are searched for satellites whose cameras, radars or crews Watched knows about, and the geostationary
  weather satellites that can see the place are listed as watching all week. The rest of the catalog is drawn on the
  globe but not searched. Military and intelligence satellites mostly aren't in public catalogs.
- In the photos Watched shows, a pixel is 10 m across at best, bigger than a car, so you can't be seen in them.
  Commercial cameras in the *could have pointed here* group see down to about 30 cm, but their operators don't
  publish where they pointed or what they saw.
- The public orbit data (element sets) is accurate to about a kilometre when it is issued and drifts after that, so
  pass times can be off by a few seconds.
- Archives publish a few hours to a couple of days after capture, so the newest passes may not have a photo yet.
- Sentinel-2 and Landsat photos are toned the same way across the whole frame: a black point, a white point and a
  brightness curve, a little extra saturation, smoothed compression blocks and light sharpening. Nothing is added or
  removed. Opened full size, a Landsat 8 or 9 photo is sharpened with the same capture's 15 m panchromatic band (real
  detail the satellite recorded, from Landsat Level-1), and its labels then say 15 m.
- Sentinel-1 radar images are shown at 20 m, the radar's own resolution, in grey with a faint ice tint: brightness is
  how strongly the ground echoes the radar (rough ground and buildings bright, calm water dark), not light. Each
  image gets its own contrast. They never lead the photos, and the radar search never delays the results: the
  report takes them if they have answered by the time it is ready (they nearly always have).

- The geostationary weather satellites that watch a place all week are listed with their newest image where a public
  map service carries it: GOES and Himawari from NASA, the two Meteosats from EUMETSAT. That image closes the gallery
  and can be opened, replayed and shared like a pass; the others of the week are counted from the satellite's
  schedule, not fetched. Its replay shows the imager's scan line crossing the place: the time is good to about a
  minute, and the app says "about". At night Himawari and Meteosat-9 are shown in infrared, labelled *IR*: cloud tops
  by temperature, colder is lighter. NASA draws its coldest cloud tops in a colour code; Watched puts them back on
  the grey scale, in the same order. At the rim of a satellite's view an image can be part empty; it is shown small
  in its row, or not at all, and neither counted nor put in the gallery.

Everything uncertain is labelled as such in the app.
