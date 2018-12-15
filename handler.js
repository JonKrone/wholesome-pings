'use strict'

const req = require('request-promise-native')
// const sgMail = require('@sendgrid/mail')
// const cheerio = require('cheerio')

// sgMail.setApiKey(process.env.SENDGRID_API_KEY)
// const $ = cheerio.load('./wholesome-template.html')

const baseUrl = 'https://reddit.com/r'
const wholesomeSubreddits = [
  'RandomKindness',
  'UpliftingNews',
  'WholesomeMemes',
]

const multiredditUrl = `${baseUrl}/${wholesomeSubreddits.join('+')}`
const topResultsUrl = `${multiredditUrl}/top/.json?sort=top&t=week`

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

// const testEmails = [
//   //   { name: 'Lara', email: 'lara.christley@gmail.com' },
//   //   { name: 'Anne', email: 'annie@anniehayeswellness.com' },
//   //   { name: 'Caitlin', email: 'caitlinrduff@gmail.com' },
//   //   { name: 'Bryan', email: 'bstarry44@q.com' },
//   //   { name: 'Andrew', email: 'leonard.andrew13@gmail.com' },
//   { name: 'JoJo', email: 'JonathanKrone+1@gmail.com' },
//   { name: 'Jonathan', email: 'JonathanKrone+2@gmail.com' },
//   { name: 'Jo', email: 'JonathanKrone+3@gmail.com' },
//   //   { name: 'Ashley', email: 'ashleykatzakian@gmail.com' },
//   //   { name: 'Amrita', email: 'amrita.karia@gmail.com' },
// ]

module.exports.wholesomePing = async (event, context) => {
  // receive trigger
  // get top posts of the last week
  // format them
  // send them out to a randomly selected friend, with the recipient cc'd

  return req(topResultsUrl, { json: true })
    .then(resp => {
      // console.log('keys:', resp.json())
      const topTen =
        resp &&
        resp.data &&
        resp.data.children &&
        resp.data.children.slice(0, 10)
      const pick = selectOne(topTen)
      const { permalink, url, title } = pick
      // const recipient = selectOne(testEmails)

      // console.log('data!:', pick)
      // console.log('reddit link:', permalink)
      // console.log('image/source url:', url)
      // console.log('title:', title)

      return req
        .post(
          'https://api.catapult.inetwork.com/v2/users/u-75277up3bzfsbshdt4xnxdq/messages',
          {
            json: true,
            headers: { 'content-type': 'application/json' },
            auth: {
              user: 't-4y64pyotd4ptvcsz37ifc7q',
              pass: 'nizkm5lxmx6m3nhg2g4ejjn2vlovmaoy4hen23y',
            },
            body: {
              to: ['+18044058142'],
              from: '+18042344180',
              text: 'hey! ' + title,
              applicationId: 'a-57z354bt2znuxl2d3vazjqq',
              tag: 'test message',
            },
          }
        )
        .then(data => console.log('data:', data))
    })
    .catch(error => {
      console.log('error:', error)
      // send email to krone
    })

  // https: return {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return {
  //   message: 'Go Serverless v1.0! Your function executed successfully!',
  //   event,
  // }

  // failsafe
  context.done()
}

function selectOne(list) {
  if (!Array.isArray(list)) {
    throw Error('selectOne must be called on an array of items')
  }

  const rndIdx = Math.floor(Math.random() * list.length)
  return list[rndIdx]
}

// data structure:
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
