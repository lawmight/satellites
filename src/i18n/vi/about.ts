/**
 * Vietnamese copy for the About page (see src/i18n/en/about.ts; docs/i18n/vi.md §3.9 is the authority).
 *
 * Why it reads this way: the English is the owner's, short and conversational, so the Vietnamese is plain spoken-
 * standard prose: *bạn* for the reader, *chúng tôi* for us, and *tôi* in the reader's own questions (*Vệ tinh có thấy
 * tôi không?*). No particles, no *quý vị*, no apology. The verdicts are quoted in their own words (*“có thể đã hướng
 * về đây”*). The north arrow is B (*bắc*), as on the photo. Privacy says exactly what the English says, no more and no
 * less: *một vùng rộng khoảng 10 km*, never "anonymous" or "100%". Product, agency, licence and people's names stay as
 * they are; OpenStreetMap's credit takes the project's own Vietnamese wording.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('vi')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Giới thiệu',
  close: 'Đóng',
  sectionsLabel: 'Các mục',
  title: [['Cách'], [accent('hoạt động'), '.']] as Rich[],
  lede: 'Chọn một điểm trên Trái Đất. Chúng tôi tính xem những vệ tinh nào đã bay qua đó trong tuần qua, rồi đi tìm những hình ảnh mà chúng đã ghi lại. Mọi thứ chạy ngay trong trình duyệt của bạn, trên dữ liệu công khai.',

  sections: {
    short: 'Nói ngắn gọn',
    method: 'Cách chúng tôi tìm lượt bay',
    words: 'Ý nghĩa các nhãn',
    accuracy: 'Những gì chúng tôi không thấy',
    privacy: 'Quyền riêng tư',
    credits: 'Ghi công',
    keys: 'Bàn phím',
  },

  short: {
    live: {
      term: 'Có phải trực tiếp không?',
      text: 'Không hẳn. Ảnh về tới kho lưu trữ từ vài giờ đến một hai ngày sau khi được chụp, nên những lượt bay mới nhất có thể chưa có ảnh.',
    },
    seeMe: {
      term: 'Vệ tinh có thấy tôi không?',
      text: 'Không. Rõ nhất thì mỗi điểm ảnh ở đây cũng rộng 10 m. Một chiếc ô tô chỉ là một điểm ảnh. Bạn không hiện lên trong ảnh.',
    },
    every: {
      term: 'Đây có phải là tất cả các vệ tinh không?',
      text: 'Không. Vệ tinh quân sự và vệ tinh do thám phần lớn không có trong danh mục công khai, và các công ty không cho biết họ hướng camera về đâu.',
    },
  },

  method: {
    orbits: [
      'Mọi vật thể trên quỹ đạo đều có một bộ số công khai mô tả đường đi của nó. ',
      link('CelesTrak'),
      ' công bố các bộ số này từ dữ liệu theo dõi của Lực lượng Không gian Hoa Kỳ, và cứ sáu giờ chúng tôi lại lấy một bản mới.',
    ] as AboutPart[],
    loaded: (count: number, stamp: string): AboutPart[] => ['Trang này đã tải ', num(f.int(count)), ' vật thể, lấy lúc ', num(stamp), '.'],
    sgp4: 'Chúng tôi dùng SGP4, mô hình quỹ đạo tiêu chuẩn, để tính đường bay của từng vệ tinh trong bảy ngày qua, và ghi lại mọi lần chỗ của bạn nằm trong tầm nhìn của vệ tinh.',
    facts: {
      straightDown: {
        term: 'Nhìn thẳng xuống',
        text: 'Sentinel-2 và Landsat nhìn thẳng xuống một dải mặt đất, rộng khoảng 290 km với Sentinel-2 và 185 km với Landsat. Bạn phải ở trong dải đó.',
      },
      tilting: {
        term: 'Camera nghiêng được',
        text: 'Nhiều vệ tinh thương mại có thể nghiêng 30 đến 45 độ. Nếu bạn ở trong tầm với, chúng tôi gọi đó là “có thể đã hướng về đây”.',
      },
      daylight: {
        term: 'Ban ngày',
        text: 'Camera thường cần ánh sáng Mặt Trời. Một lượt bay trong bóng tối không bao giờ được tính là có ảnh chụp.',
      },
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 không cần Mặt Trời. Vệ tinh phát sóng vi ba và ghi lại sóng phản xạ, nhìn chếch sang một bên đường bay, nên thấy được xuyên mây và cả vào ban đêm. Ảnh của Sentinel-1 cũng công khai, nên chúng tôi hiển thị chúng dưới dạng ảnh xám: chỗ sáng là đất gồ ghề và nhà cửa, chỗ tối là mặt nước lặng.',
      },
      weather: {
        term: 'Vệ tinh khí tượng',
        text: 'Một vài vệ tinh đứng yên trên xích đạo và quan sát nửa hành tinh mỗi 10 phút. Nếu bạn ở phía Trái Đất mà chúng nhìn thấy, bạn có mặt trong mọi khung hình.',
      },
    },
    archives:
      'Sau đó chúng tôi tìm trong các kho lưu trữ ảnh (Microsoft Planetary Computer, Element 84 và NASA) và đối chiếu từng bức ảnh với lượt bay đã ghi lại ảnh đó. Mọi bức ảnh bạn thấy đều là ảnh thật, được cắt quanh chỗ của bạn.',
    photoFacts: {
      touchUps: {
        term: 'Chỉnh sửa ảnh',
        text: 'Ảnh Sentinel-2 và Landsat được cân bằng màu, làm mịn và làm nét nhẹ cho màn hình của bạn, theo cùng một cách trên toàn bức ảnh. Không có gì được thêm vào hay xóa đi.',
      },
      whichWayUp: {
        term: 'Đâu là phía bắc',
        text: 'Ảnh Sentinel-2 và Landsat giữ nguyên lưới bản đồ của kho lưu trữ cho nơi bạn chọn, nên hướng bắc có thể lệch vài độ so với phía trên. Khi bạn mở một bức ảnh, mũi tên B cho thấy chính xác hướng bắc ở đâu.',
      },
    },
  },

  verdictMore: {
    imaged: 'Nếu chúng tôi hiển thị, đó là ảnh thật.',
    likely: 'Ảnh chưa được công khai, hoặc đã bị loại vì nhiều mây.',
    could: 'Không có cách nào biết camera có thật sự làm vậy hay không.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Vị trí chính xác',
      text: 'Dữ liệu quỹ đạo công khai chính xác đến khoảng 1 km và lệch dần một chút mỗi ngày. Thời gian có thể sai vài giây.',
    },
    secret: { term: 'Vệ tinh bí mật', text: 'Một số camera tốt nhất trên quỹ đạo thuộc về quân đội. Chúng không xuất hiện ở đây.' },
    clouds: {
      term: 'Mây',
      text: 'Nhiều bức ảnh chỉ toàn mây. Khi kho lưu trữ có dữ liệu về mây, chúng tôi kiểm tra đúng điểm ảnh ở chỗ của bạn và cho bạn biết.',
    },
    delays: { term: 'Độ trễ', text: 'Ảnh có thể mất một hai ngày mới xuất hiện.' },
  },

  privacy: {
    where: { term: 'Chạy ở đâu', text: 'Phần tính toán quỹ đạo diễn ra trong trình duyệt của bạn.' },
    kept: {
      term: 'Chúng tôi lưu gì',
      text: 'Chúng tôi đếm lượt tìm kiếm theo thành phố, thị trấn và theo một vùng rộng khoảng 10 km, không bao giờ theo đúng chỗ của bạn, và đếm số lần nội dung được mở và chia sẻ. Không địa chỉ IP, không cookie của riêng chúng tôi, không có gì nối lần truy cập này với lần sau.',
    },
    others: {
      term: 'Ai khác thấy được',
      text: 'Phần lớn tên địa điểm lấy từ một danh sách có sẵn trong trang. Các lượt tìm khác được gửi tới Open-Meteo, Photon hoặc Nominatim. Ảnh được tải thẳng từ các kho lưu trữ. Dịch vụ lưu trữ web của chúng tôi đếm lượt xem trang và tốc độ, không dùng cookie, và có thể đặt một cookie bảo mật để phân biệt người với bot. Chúng tôi không bao giờ đọc cookie đó.',
    },
    links: {
      term: 'Liên kết chia sẻ',
      text: 'Chỉ được tạo khi bạn chia sẻ. Ai có liên kết sẽ thấy tên địa điểm, một điểm được làm tròn đến khoảng 1 km, và lượt bay bạn đã chọn.',
    },
  },

  credits: {
    madeBy: { who: 'Thực hiện', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' trên X'] },
    support: { who: 'Ủng hộ', text: [link('Hãy giúp Watched luôn miễn phí :)')] as AboutPart[] },
    gibs: 'Ảnh từ GIBS của NASA, thuộc EOSDIS. GOES qua NOAA và CIRA, Himawari qua JMA.',
    archives: {
      who: 'Kho lưu trữ',
      text: 'Microsoft Planetary Computer và Element 84 Earth Search; kênh 15 m của Landsat từ Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Quỹ đạo', text: 'Bộ tham số quỹ đạo từ CelesTrak. SGP4 do satellite.js cung cấp.' },
    placeNames: { who: 'Tên địa điểm', text: 'Photon của komoot. Dữ liệu bản đồ © Những người đóng góp OpenStreetMap (ODbL).' },
    textures: { who: 'Bề mặt Trái Đất', text: 'Solar System Scope (CC BY 4.0), từ NASA Blue Marble và Black Marble.' },
    // Honest labelling: a Vietnamese page sets every letter in these faces, none in the brand's (src/styles/scripts.css).
    type: { who: 'Phông chữ', text: 'Noto Sans và Noto Serif Display của Google, JetBrains Mono của JetBrains (SIL OFL).' },
  },

  keys: {
    search: 'Tìm một địa điểm',
    suggestions: 'Di chuyển giữa các gợi ý',
    choose: 'Chọn',
    passes: 'Chuyển giữa các lượt bay',
    photos: 'Ảnh trước / tiếp theo',
    expand: 'Phóng to ảnh',
    zoom: 'Thu phóng (khi đã phóng to)',
    play: 'Phát hoặc tạm dừng phát lại',
    back: 'Quay lại, hoặc đóng',
    help: 'Trang này',
  },
  /** As Vietnamese keyboards print them (US layout) */
  keyNames: { enter: 'Enter', space: 'Space', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Do ', link(handle), ' thực hiện'],
  footerNote: 'Làm từ dữ liệu công khai. Không bức ảnh nào ở đây do chúng tôi chụp.',
}

export default about
