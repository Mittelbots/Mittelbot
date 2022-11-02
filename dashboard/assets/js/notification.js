export class Notification {
    constructor(msg, isSuccess) {
        this.msg = msg;
        this.isSuccess = isSuccess;
    }

    show() {
        let notification = document.createElement('div');
        notification.classList.add('notification');
        notification.classList.add(this.isSuccess ? 'success' : 'error');
        notification.innerHTML = this.msg;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
