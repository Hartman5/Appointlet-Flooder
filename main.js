import Main from "./modules/main.js";

(async () => {
    const main = new Main('Castform');
    await main.getTeamAndMeetingType();
    var fields = await main.getFields();
    var times = await main.getAvailableTimes();
    for(var x in times) {
        await main.register(fields, times[x]);
        await main.confirm()
        console.log(`[+] Meeting Scheduled! - ${x+1}/${times.length}`)
    }
})();