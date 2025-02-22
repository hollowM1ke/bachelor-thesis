export default function executor () {
    const jobs = [];

    function scheduleJob (func) {
        jobs.push(func);
    }

    function flush () {
        jobs.forEach(job => job());
    }

    function startTransaction () {
        if (jobs.length > 0) {
            flush();
        }
    }

    return {
        scheduleJob,
        flush,
        startTransaction
    };
}
