import Main from "./modules/main.js";

import { question } from 'readline-sync';

(async () => {
    const main = new Main('Castform');
    await main.getTeamAndMeetingType();
    var fields = await main.getFields();
    // for(var x in fields) {
    //     fields[x].answer = question(`${fields[x].text}\n`);
    // }
    var times = await main.getAvailableTimes();
    for(var x in times) {
        await main.register(fields, times[x]);
        await main.confirm()
        console.log(`[+] Meeting Scheduled! - ${x+1}/${times.length}`)
    }
})();