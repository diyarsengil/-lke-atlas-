# Ülke Kültür ve Tarih Atlası

Ülkelerin kısa tanıtımlarını, tarihî arka planını, temel bilgilerini ve yöneticilerini gösteren, HTML, CSS ve JavaScript ile hazırlanmış statik bir web projesi.

## Dosyalar

- `index.html` — sayfanın yapısı
- `style.css` — görünüm, responsive düzen ve fareyle üzerine gelme efektleri
- `script.js` — ülke araması, ülke verilerinin yüklenmesi ve lider biyografileri

## GitHub Pages'te yayınlama

Bu proje derleme adımı gerektirmez. GitHub Pages ayarlarında, sitenin yayınlanacağı dal ve klasör olarak proje kökünü seçebilmek için bu üç dosyayı GitHub deposunun kök dizinine koyun:

```text
index.html
style.css
script.js
README.md
```

Ardından:

1. GitHub'da depoyu açın ve **Settings** → **Pages** bölümüne gidin.
2. **Build and deployment** altında **Deploy from a branch** seçin.
3. Yayınlamak istediğiniz dalı (genellikle `main`) ve klasörü (`/ (root)`) seçip **Save**'e tıklayın.
4. Pages bölümünde verilen site adresini açın. İlk yayınlama birkaç dakika sürebilir.

Dosyalar şu anda `outputs/` klasöründeyse iki seçenek vardır: onları deponun köküne taşıyıp yukarıdaki ayarları kullanın ya da Pages ayarlarında `outputs/` klasörünü yayın kaynağı olarak seçin (GitHub Pages'te bu klasör seçeneği yalnızca uygun dağıtım kurulumlarında sunulabilir). En basit yöntem, dört dosyayı depo köküne koymaktır.

## Veriler ve internet bağlantısı

- Ülke listesi `mledoze/countries` veri kümesinden yüklenir.
- Ülke tanıtımları ve görselleri, önce Türkçe Wikipedia'dan; bulunamazsa İngilizce Wikipedia'dan alınır.
- Türkiye cumhurbaşkanları sayfada tanımlı listeden gelir. Diğer ülkelerin lider zaman çizelgeleri Wikidata'dan alınır; tarihî kayıtlar her ülke için aynı kapsamda olmayabilir.
- Google Fonts ve uzaktaki görseller de internet bağlantısı gerektirebilir.

Sayfa çevrimiçi kaynakları tarayıcıdan çağırdığı için ülke araması, metinler ve lider biyografileri internet bağlantısı olmadan yüklenmez. Projede gizli API anahtarı veya sunucu tarafında çalışan kod bulunmaz.

## Kaynaklar ve lisanslar

- Ülke verileri: [mledoze/countries](https://github.com/mledoze/countries) — deposunda belirtilen ODbL lisans koşullarına tabidir.
- Tanıtım ve biyografi metinleri: Wikipedia; içerikler ilgili Wikipedia sayfalarına bağlanır ve Wikipedia'nın lisans koşullarına tabidir.
- Lider verileri: [Wikidata Query Service](https://query.wikidata.org/) — açık veriler, Wikidata'nın CC0 koşullarıyla sunulur.
- Fotoğraflar ve yazı tipleri uzak kaynaklardan yüklenebilir; kullanım koşulları ilgili sağlayıcılara aittir.

## Yerel önizleme

`index.html` dosyasını bir tarayıcıda açabilirsiniz. Bazı tarayıcılar `file://` adresinden harici API çağrılarını kısıtlayabilir. Böyle bir durumda GitHub Pages'e yükleyerek veya yerel bir statik web sunucusu üzerinden açarak deneyin.
