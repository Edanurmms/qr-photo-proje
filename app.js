import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Supabase bilgileri
const SUPABASE_URL = 'https://pwgeljpcikmukxtcorlx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_4d-B0DloJ40vEsmbJTJBpQ_7rk9Mrt1'

// Supabase client oluştur
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Türkçe karakterleri dönüştürme fonksiyonu
function normalizeTurkishChars(text) {
  return text
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ı/g, "i").replace(/İ/g, "I")
}

// Kullanıcı ID alma (anon için fake ID)
const userId = 'anon-user'  

// Fotoğraf yükleme
async function uploadPhoto(file, customFileName) {
  const path = `${userId}/${customFileName}`
  const { data, error } = await supabase
    .storage
    .from('beyza-photo')
    .upload(path, file)

  if (error) {
    alert('Yükleme hatası: ' + error.message)
  } else {
    alert('Fotoğraf yüklendi: ' + data.path)
  }
}

// Dosyaları listeleme (2’şer gruplar halinde, son satır tek kalırsa tek gösterilir)
async function listPhotos() {
  const { data, error } = await supabase
    .storage
    .from('beyza-photo')
    .list(`${userId}/`)

  const listDiv = document.getElementById('fileList')
  listDiv.innerHTML = ''

  if (error) {
    listDiv.textContent = 'Listeleme hatası: ' + error.message
  } else {
    if (data.length === 0) {
      listDiv.textContent = 'Hiç dosya yok.'
    } else {
      const ul = document.createElement('ul')

      for (let i = 0; i < data.length; i += 2) {
        const li = document.createElement('li')
        li.textContent = "• "

        // İlk dosya
        const { data: urlData1 } = supabase
          .storage
          .from('beyza-photo')
          .getPublicUrl(`${userId}/${data[i].name}`)
        const link1 = document.createElement('a')
        link1.href = urlData1.publicUrl
        link1.textContent = data[i].name
        link1.target = "_blank"
        li.appendChild(link1)

        // İkinci dosya varsa ekle
        if (i + 1 < data.length) {
          li.appendChild(document.createTextNode(" | "))
          const { data: urlData2 } = supabase
            .storage
            .from('beyza-photo')
            .getPublicUrl(`${userId}/${data[i+1].name}`)
          const link2 = document.createElement('a')
          link2.href = urlData2.publicUrl
          link2.textContent = data[i+1].name
          link2.target = "_blank"
          li.appendChild(link2)
        }

        ul.appendChild(li)
      }

      listDiv.appendChild(ul)
    }
  }
}

// HTML bağlantıları
window.handleUpload = function() {
  const file = document.getElementById('photoInput').files[0]
  const name = document.getElementById('nameInput').value.trim()

  if (!file) {
    alert('Lütfen bir dosya seçin.')
    return
  }

  const safeName = normalizeTurkishChars(name).replace(/\s+/g, '_')
  const normalizedFileName = normalizeTurkishChars(file.name).replace(/\s+/g, '_')
  const customFileName = safeName ? `${safeName}_${normalizedFileName}` : normalizedFileName

  const renamedFile = new File([file], customFileName, { type: file.type })
  uploadPhoto(renamedFile, customFileName)
}

window.handleList = function() {
  listPhotos()
}
