window.dataHub = {
    set(key, value) {
        localStorage.setItem('jinyu_' + key, JSON.stringify(value));
    },
    get(key, defaultValue) {
        const val = localStorage.getItem('jinyu_' + key);
        return val ? JSON.parse(val) : defaultValue;
    }
};