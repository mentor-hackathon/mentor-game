var qrCode = require('qrcode');

function g() {
    qrCode.toDataURL("https://qr.id.vin/hook?url=https://mentor-hackathon.ngrok.io/hook?type=init&method=GET",{},function (err,url) {
        console.log(url)
    })
}

g()