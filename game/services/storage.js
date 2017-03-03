var storage = {
    setItem : function (key, value) {
        window.localStorage.setItem(key, value)
    },
    getItem : function (key) {
        var item = window.localStorage.getItem(key);
        if (item) return item
        return '';
    }
};

module.exports = storage;