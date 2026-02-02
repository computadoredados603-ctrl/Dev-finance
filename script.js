const Modal = {
    open() { document.querySelector('.modal-overlay').classList.add('active'); },
    close() { document.querySelector('.modal-overlay').classList.remove('active'); }
};

const Storage = {
    get() { return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []; },
    set(transactions) { localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)); }
};

const Transaction = {
    all: Storage.get(),
    add(transaction) { Transaction.all.push(transaction); App.reload(); },
    remove(index) { Transaction.all.splice(index, 1); App.reload(); },
    incomes() {
        return Transaction.all
            .filter(t => t.amount > 0)
            .reduce((acc, t) => acc + t.amount, 0);
    },
    expenses() {
        return Transaction.all
            .filter(t => t.amount < 0)
            .reduce((acc, t) => acc + t.amount, 0);
    },
    total() { return Transaction.incomes() + Transaction.expenses(); }
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        DOM.transactionsContainer.appendChild(tr);
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);
        return `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><i onclick="Transaction.remove(${index})" class="bi bi-trash" style="color: var(--danger); cursor: pointer;"></i></td>
        `;
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() { DOM.transactionsContainer.innerHTML = ""; }
};

const Utils = {
    formatAmount(value) { return Math.round(Number(value) * 100); },
    formatDate(date) {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;
        return signal + value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
};

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues() { return { description: Form.description.value, amount: Form.amount.value, date: Form.date.value }; },
    validateFields() {
        const { description, amount, date } = Form.getValues();
        if (!description.trim() || !amount.trim() || !date.trim()) throw new Error("Preencha todos os campos");
    },
    formatValues() {
        let { description, amount, date } = Form.getValues();
        return { description, amount: Utils.formatAmount(amount), date: Utils.formatDate(date) };
    },
    submit(event) {
        event.preventDefault();
        try {
            Form.validateFields();
            Transaction.add(Form.formatValues());
            Form.description.value = ""; Form.amount.value = ""; Form.date.value = "";
            Modal.close();
        } catch (error) { alert(error.message); }
    }
};

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        DOM.updateBalance();
        Storage.set(Transaction.all);
    },
    reload() { DOM.clearTransactions(); App.init(); }
};

App.init();
