function showPushNotification(type, msg) {

    let notice

    if(!document.getElementById('notice')){
        notice = document.createElement('div')
        notice.innerHTML = pushNotificationHTML
        notice = notice.firstElementChild
        document.getElementById('wrapper').firstElementChild.appendChild(notice)
    }

    notice = document.getElementById('notice')
    notice.classList.remove('show')
    notice.classList.add('hide')
    notice.classList.remove('info')
    notice.classList.remove('success')
    notice.classList.remove('error')

    switch (type) {
        case 'success':
            notice.classList.add('success')
            break
        case 'error':
            notice.classList.add('error')
            break
        case 'info':
            notice.classList.add('info')
            break
    }

    notice.querySelector('.msg').innerText = ''
    notice.querySelector('.msg').innerText = msg

    notice.classList.toggle('hide')
    notice.classList.toggle('show')

    setTimeout(() => {
        if (notice.classList.contains('show')) {
            notice.classList.toggle('show')
            notice.classList.toggle('hide')
        }
    }, 5000)

}