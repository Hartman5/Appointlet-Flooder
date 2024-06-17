import Main from "./modules/main.js";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    const main = new Main('TARGET USERNAME HERE');
    await main.getTeamAndMeetingType();
    var fields = await main.getFields();
    var times = await main.getAvailableTimes();
    for(var x in times) {
        try {
            await main.register(fields, times[x]);
            await main.confirm();
            console.log(`[+] Meeting Scheduled! - ${x}/${times.length}`);
        } catch {
            console.log('Ratelimit - Waiting 10s');
            await sleep(10000);
        }
    }
})();