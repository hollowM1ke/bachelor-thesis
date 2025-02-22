export default function CRDTStorage () {
    // TODO; segment by type
    const storage = new Map();

    function getObject (key) {
        return storage.get(key);
    }

    function putObject (key, object) {
        storage.set(key, object);
    }

    function removeObject (key) {
        storage.delete(key);
    }

    function containsKey (key) {
        return storage.has(key);
    }

    return {
        getObject,
        putObject,
        removeObject,
        containsKey
    };
}
