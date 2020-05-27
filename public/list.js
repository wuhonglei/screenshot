var vm = new Vue({
    el: '#wrapper',
    data: {
        text: 'wuhongle',
        list: []
    },
    created() {
        this.list = this.loadData();
        console.info('this.list', this.list);
    },
    methods: {
        loadData() {
            let count = 0;
            let list = [];
            while (true) {
                let key = localStorage.key(count++);
                if (!key) {
                    break;
                }

                try {
                    let item = JSON.parse(localStorage.getItem(key));
                    list.push(item);
                } catch (error) {
                    console.info(error);
                }
            }
            return list;
        },
        refresh() {
            console.info('刷新')
            this.list = this.loadData();
        }
    }
})