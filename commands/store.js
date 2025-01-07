import axios from 'axios'
import fs from 'node:fs'
import template from '../templates/store.js'

export default async event => {
  try {
    const { data } = await axios.get('https://ifoodie.tw/api/restaurant/explore/?order_by=distance&latlng=' + event.message.latitude + ',' + event.message.longitude + '&limit=5')
    const stores = data.response
      .map(store => {
        const t = template()
        t.hero.url = store.cover_url
        t.body.contents[0].text = store.name
        t.body.contents[1].contents[0].contents[1].text = store.address
        t.body.contents[1].contents[1].contents[1].text = store.opening_hours
        t.body.contents[1].contents[2].contents[1].text = store.phone || '沒有電話'
        t.footer.contents[0].action.uri = store.website || 'https://ifoodie.tw/restaurant/' + store.id
        return t
      })

    const result = await event.reply({
      type: 'flex',
      altText: '愛食記',
      contents: {
        type: 'carousel',
        contents: stores
      }
    })
    console.log(result)

    if (process.env.DEBUG === 'true' && result.message) {
      fs.writeFileSync('./dump/store.json', JSON.stringify(stores, null, 2))
    }
  } catch (error) {
    console.error(error)
  }
}
