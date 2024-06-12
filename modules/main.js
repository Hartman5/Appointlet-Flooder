import fs from 'fs';
import { faker } from '@faker-js/faker';
import { request, ProxyAgent } from 'undici';
import { Cookie, CookieJar } from 'tough-cookie';

function getProxy() {
    const proxies = fs.readFileSync('./helpers/proxies.txt', 'utf8').split('\n');
    return proxies[Math.floor(Math.random() * proxies.length)];
}

function getRandomTimezone() {
    const data = fs.readFileSync('./helpers/timezones.json', 'utf8');
    const timezones = JSON.parse(data);
    const randomIndex = Math.floor(Math.random() * timezones.length);
    return timezones[randomIndex].name;
}

function getDomain() {
    var domains = [
        '@gmail.com',
        '@yahoo.com',
        '@hotmail.com',
        '@aol.com',
        '@outlook.com',
        '@icloud.com',
        '@protonmail.com',
        '@zoho.com',
        '@yandex.com',
        '@mail.com',
        '@gmx.com',
    ]

    return domains[Math.floor(Math.random() * domains.length)];
}

function randomChars(len) {
    let str = '';
    const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < len; i++) {
        str += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return str;
}

class Main {
    constructor(target) {
        this.start = null;
        this.times = [];
        this.fields = [];
        this.target = String(target).toLowerCase();
        this.proxy = getProxy();
        this.cookieJar = new CookieJar();
    }

    async __send_request(url, method, headers, body, x, debug) {
        try {
            const parsed_url = new URL(`http://${this.proxy}`);
            this.agent = new ProxyAgent({ uri: `http://${this.proxy}` });
    
            if (parsed_url?.username && parsed_url?.password) {
                this.agent = new ProxyAgent({
                    uri: "http://royal.vital-proxies.com:12321",
                    auth: Buffer.from(`${parsed_url.username}:${parsed_url.password}`).toString("base64"),
                });
            }
    
            if (x !== true) {
                if (this.cookieJar && this.cookieJar.getCookiesSync(url).length > 0) {
                    headers["cookie"] = this.cookieJar.getCookieStringSync(url);
                }
            }
    
            if (debug) console.log(headers);
    
            var response = await request(url, {
                method: method,
                headers: headers,
                body: body,
                extraConfiguration: this.agent ? { dispatcher: this.agent } : {},
                tls: {
                    rejectUnauthorized: true,
                    checkServerIdentity: (host, cert) => {
                        const expectedFingerprint = "b32309a26951912be7dba376398abc3b";
                        if (cert.fingerprint256 !== expectedFingerprint) {
                            throw new Error(`Server TLS certificate fingerprint mismatch, expected ${expectedFingerprint}, got ${cert.fingerprint256}`);
                        }
                    },
                },
            });
    
            let responseCookies = response.headers["set-cookie"];
            if (typeof responseCookies === "string") {
                responseCookies = [responseCookies];
            }
    
            if (responseCookies) {
                responseCookies.forEach((cookieStr) => {
                    const cookie = Cookie.parse(cookieStr);
                    this.cookieJar.setCookieSync(cookie, url);
                });
            }
    
            try {
                const chunks = [];
                for await (const chunk of response.body) {
                    chunks.push(chunk);
                }
                response.body = Buffer.concat(chunks).toString("utf8");
                return response;
            } catch (error) {
                console.error("Error processing response body:", error);
                return response;
            }
        } catch (error) {
            console.error("Error in __send_request:", error);
            return { error: error.message };
        }
    }

    async getTeamAndMeetingType() {
        var res = await this.__send_request('https://app.appointlet.com/scheduler', 'POST', {
            host: 'app.appointlet.com',
            connection: 'keep-alive',
            'sec-ch-ua': '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            accept: 'application/json',
            'content-type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            'sec-gpc': '1',
            'accept-language': 'en-US,en;q=0.6',
            origin: 'https://appt.link',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://appt.link/',
            'accept-encoding': 'utf08'
        },
        JSON.stringify({
            "query": "query getTeamAndMeetingType($teamSlug: String!, $meetingTypeSlug: String!) {\n  team: getTeamBySlug(slug: $teamSlug) {\n    name\n    image\n    slug\n    language\n    description\n    profile {\n      ...ProfileData\n    }\n  }\n  meetingType: getMeetingType(teamSlug: $teamSlug, slug: $meetingTypeSlug) {\n    ...MeetingTypeData\n  }\n}\n\nfragment ProfileData on SchedulerProfileNode {\n  id\n  brandColor\n  showAppointletBranding\n  gtmContainerId\n  featureFlags\n}\n\nfragment MeetingTypeData on SchedulerMeetingTypeNode {\n  name\n  description\n  locationType\n  slug\n  duration\n  timezone\n  image\n  priceCurrency\n  price\n  id\n  priceFormatted\n  usesLocalTimezone\n  hostAssignmentStrategy\n}\n",
            "variables": {
              "teamSlug": this.target,
              "meetingTypeSlug": "meet"
            }
        }));

        this.meetingID = JSON.parse(res.body).data.meetingType.id;
    }

    async getFields() {
        var res = await this.__send_request('https://app.appointlet.com/scheduler', 'POST', {
            host: 'app.appointlet.com',
            connection: 'keep-alive',
            'sec-ch-ua': '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            accept: 'application/json',
            'content-type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            'sec-gpc': '1',
            'accept-language': 'en-US,en;q=0.6',
            origin: 'https://appt.link',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://appt.link/',
            'accept-encoding': 'gzip, deflate, br, zstd'
        },
        JSON.stringify({
            "query": "query getFormFields($slug: String!, $teamSlug: String!) {\n  fieldsContainer: getMeetingType(slug: $slug, teamSlug: $teamSlug) {\n    fields {\n      edges {\n        node {\n          id\n          name\n          fieldType\n          helpText\n          required\n          choices\n          order\n          slug\n          visible\n        }\n      }\n    }\n  }\n}",
            "variables": {
                "slug": "meet",
                "teamSlug": this.target
            }
        }));

        var rawFields = JSON.parse(res.body).data.fieldsContainer.fields.edges

        for(var x in rawFields) {
            this.fields.push({
                id: rawFields[x].node.id,
                text: rawFields[x].node.helpText,
            })
        }

        return this.fields;
    }

    async getAvailableTimes() {
        var body = {
            "query": "query getAvailability($slug: String!, $teamSlug: String!, $start: DateTime, $end: DateTime, $hostMemberId:ID) {\n  availability: getMeetingType(slug: $slug, teamSlug: $teamSlug) {\n    availableTimes(start: $start, end: $end, hostMemberId:$hostMemberId) {\n      data\n      hasNextPage\n      nextPageStart\n    }\n  }\n}",
            "variables": {
              "slug": "meet",
              "teamSlug": this.target,
              "hostMemberId": ""
            }
        };

        if(this.start != null) {
            body.variables.start = this.start;
        }

        var res = await this.__send_request('https://app.appointlet.com/scheduler', 'POST', {
            host: 'app.appointlet.com',
            connection: 'keep-alive',
            'sec-ch-ua': '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            accept: 'application/json',
            'content-type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            'sec-gpc': '1',
            'accept-language': 'en-US,en;q=0.6',
            origin: 'https://appt.link',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://appt.link/',
            'accept-encoding': 'utf-8'
        }, JSON.stringify(body));

        this.times.push(...JSON.parse(res.body).data.availability.availableTimes.data)
        if(JSON.parse(res.body).data.availability.availableTimes.hasNextPage) {
            this.start = JSON.parse(res.body).data.availability.availableTimes.nextPageStart;
            await this.getAvailableTimes();
        }

        return this.times;
    }

    async register(fields, time) {
        this.fields = fields;

        var body = {
            "query": "mutation requestMeeting($input: RequestMeetingInput!) {\n  requestMeeting(input: $input) {\n    errors {\n      field\n      messages\n    }\n    data {\n      externalId\n      redirectUrl\n    }\n  }\n}",
            "variables": {
              "input": {
                "meetingType": String(this.meetingID),
                "start": String(time),
                "attendee": {
                  "firstName": faker.person.firstName(),
                  "lastName": faker.person.lastName(),
                  "email": `${randomChars(7)}${getDomain()}`,
                  "timezone": String(getRandomTimezone()),
                  "utmCampaign": "",
                  "utmMedium": "",
                  "utmSource": "",
                  "utmContent": "",
                  "utmTerm": "",
                  "payment": "",
                  "fieldSubmissions": []
                }
              }
            }
        }

        for(var x in this.fields) {
            body.variables.input.attendee.fieldSubmissions.push({
                "field": String(this.fields[x].id),
                "value": `\"${faker.lorem.sentence()}\"`
            })
        }

        var res = await this.__send_request('https://app.appointlet.com/scheduler', 'POST', {
            host: 'app.appointlet.com',
            connection: 'keep-alive',
            'sec-ch-ua': '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            accept: 'application/json',
            'content-type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            'sec-gpc': '1',
            'accept-language': 'en-US,en;q=0.6',
            origin: 'https://appt.link',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://appt.link/',
            'accept-encoding': 'utf-8'
        }, JSON.stringify(body));

        this.externalID = JSON.parse(res.body).data.requestMeeting.data.externalId;
    }

    async confirm() {
        var res = await this.__send_request('https://app.appointlet.com/scheduler', 'POST', {
            host: 'app.appointlet.com',
            connection: 'keep-alive',
            'sec-ch-ua': '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            accept: 'application/json',
            'content-type': 'application/json',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
            'sec-ch-ua-platform': '"macOS"',
            'sec-gpc': '1',
            'accept-language': 'en-US,en;q=0.6',
            origin: 'https://appt.link',
            'sec-fetch-site': 'cross-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            referer: 'https://appt.link/',
            'accept-encoding': 'utf-8'
        }, 
        JSON.stringify({
            "query": "query getAttendeeById($externalId: String!) {\n  getAttendeeById(externalId: $externalId) {\n    id\n    externalId\n    firstName\n    lastName\n    email\n    status\n    timezone\n    meeting {\n      conferenceUrl\n      confirmed\n      end\n      isCancellable\n      isReschedulable\n      location\n      locationType\n      start\n      meetingType {\n        description\n        duration\n        id\n        image\n        location\n        locationType\n        name\n        price\n        priceCurrency\n        priceFormatted\n        slug\n        hostAssignmentStrategy\n        profile {\n          ...ProfileData\n        }\n        team {\n          ...TeamData\n        }\n      }\n    }\n  }\n}\n\nfragment ProfileData on SchedulerProfileNode {\n  id\n  brandColor\n  showAppointletBranding\n  gtmContainerId\n  featureFlags\n}\n\nfragment TeamData on SchedulerTeamNode {\n  name\n  image\n  slug\n  language\n}",
            "variables": {
                "externalId": String(this.externalID)
            }
        }));

        console.log(JSON.parse(res.body));
    }
}

export default Main;