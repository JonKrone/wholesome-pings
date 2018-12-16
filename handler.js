'use strict'

const { readFileSync } = require('fs')
const { resolve } = require('path')
const req = require('request-promise-native')
const sgMail = require('@sendgrid/mail')
const cheerio = require('cheerio')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const $ = cheerio.load(readFileSync(resolve('./wholesome-template.html')))

const baseUrl = 'https://reddit.com'
const wholesomeSubreddits = [
  'UpliftingNews',
  'Aww',
  'AccidentalRenaissance',
  'OCPoetry',
  'FoodPorn',
  'Haiku',
  'Poetry',
  'HumansBeingBros',
]

const multiredditUrl = `${baseUrl}/r/${wholesomeSubreddits.join('+')}`
const topResultsUrl = `${multiredditUrl}/top/.json?sort=top&t=week`

const recipient = { name: 'Recip', email: 'JonathanKrone@gmail.com' }

// const emails = [
//   { name: 'Lara', email: 'lara.christley@gmail.com' },
//   { name: 'Anne', email: 'annie@anniehayeswellness.com' },
//   { name: 'Caitlin', email: 'caitlinrduff@gmail.com' },
//   { name: 'Bryan', email: 'bstarry44@q.com' },
//   { name: 'Andrew', email: 'leonard.andrew13@gmail.com' },
//   { name: 'Kari', email: 'kariannew29@gmail.com' },
//   { name: 'Jonathan', email: 'JonathanKrone@gmail.com' },
//   { name: 'Joe', email: 'joe.wayne.popham@gmail.com' },
//   { name: 'Ashley', email: 'ashleykatzakian@gmail.com' },
//   { name: 'Amrita', email: 'amrita.karia@gmail.com' },
// ]

const testEmails = [
  { name: 'JoJo', email: 'JonathanKrone+1@gmail.com' },
  { name: 'Jonathan', email: 'JonathanKrone+2@gmail.com' },
  { name: 'Jo', email: 'JonathanKrone+3@gmail.com' },
]

const subjects = [
  'Wham!',
  'Bam!',
  'Ping!',
  'Pow!',
  'Woah!',
  'Wow!',
  'Shazam!',
  'Yee haw!',
  'Well shiver me timbers',
]

module.exports.wholesomePing = async (event, context) => {
  return req(topResultsUrl, { json: true }).then(resp => {
    const topTen =
      resp &&
      resp.data &&
      resp.data.children &&
      resp.data.children.filter(f => f.data.is_video).slice(0, 10)
    const pick = selectOne(topTen).data
    const redditLink = `${baseUrl}${pick.permalink}`

    // console.log('data!:', pick)

    // mutate the html.. because it's the robust way..
    $('.post-title').text(pick.title)
    $('.post-permalink').html(
      `<a href="${redditLink}">${pick.subreddit_name_prefixed}</a>`
    )
    $('.post-image-link').attr('href', redditLink)

    if (pick.is_self) {
      // text-only posts are special beause they don't have images!
      $('.post-img-tag').remove()

      if (pick.selftext_html) {
        $('.self-post-content').html(pick.selftext)
      } else {
        $('.self-post-content').text(pick.title)
      }
    } else if (pick.is_video) {
      // videos are special because emails don't play them and
      // they don't have good images
      $('.post-img-tag').attr('src', pick.thumbnail)
      $('.self-post-content').text('Click to see the video')
    } else {
      $('.post-img-tag').attr('src', pick.url)
      $('.post-image-link').attr('href', redditLink)
      $('.self-post-content').remove()
    }

    console.log('sending')
    return sgMail.send({
      to: selectOne(testEmails),
      from: 'MrPresident@noreply.net',
      subject: selectOne(subjects),
      html: $.html(),
    })
  })
}

function selectOne(list) {
  if (!Array.isArray(list)) {
    throw Error('selectOne must be called on an array of items')
  }

  const rndIdx = Math.floor(Math.random() * list.length)
  return list[rndIdx]
}

// reddit response structure:
// {
//   kind: string,
//   data: {
//     after: string,
//     before: string | null,
//     children: [
//       {
//         kind: string,
//         data: {
//           permalink: string, // path to comments
//           url: string, // path to img
//           title: string, // post title
//         }
//       }
//     ],
//     dist: number,
//     modhash: string
//   }
// }
