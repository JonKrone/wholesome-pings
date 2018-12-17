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

const recipient = { name: 'Amrita', email: 'amrita.karia@gmail.com' }

const emails = [
  { name: 'Lara', email: 'lara.christley@gmail.com' },
  { name: 'Anne', email: 'annie@anniehayeswellness.com' },
  { name: 'Caitlin', email: 'caitlinrduff@gmail.com' },
  { name: 'Bryan', email: 'bstarry44@q.com' },
  { name: 'Andrew', email: 'leonard.andrew13@gmail.com' },
  { name: 'Kari', email: 'kariannew29@gmail.com' },
  { name: 'Jonathan', email: 'JonathanKrone@gmail.com' },
  { name: 'Joe', email: 'joe.wayne.popham@gmail.com' },
  { name: 'Ashley', email: 'ashleykatzakian@gmail.com' },
  { name: 'Lahli', email: 'lolltrevis@gmail.com' },
  { name: 'Danielle', email: 'dajackson95@gmail.com' },
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
      resp && resp.data && resp.data.children && resp.data.children.slice(0, 20)
    const pick = selectOne(topTen).data
    const redditLink = `${baseUrl}${pick.permalink}`

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

    const to = selectOne(emails)
    return sgMail.send({
      to: [recipient, to],
      from: 'MmePresidente@noreply.net',
      subject: selectOne(subjects),
      html: $.html(),
    })
  })
}

function selectOne(list, ignore) {
  if (!Array.isArray(list)) {
    throw Error('selectOne must be called on an array of items')
  }

  const rndIdx = Math.floor(Math.random() * list.length)
  const result = list[rndIdx]

  if (ignore && result === ignore) {
    return selectOne(list, ignore)
  }

  return result
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
