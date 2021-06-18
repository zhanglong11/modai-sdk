// import registerPromiseWorker from 'promise-worker/register'
importScripts('promise-worker.register.js')
// importScripts('https://s3.cn-north-1.amazonaws.com.cn/api-release.modeloapp.com/prod/modeloapi-2.8-lts.js')
// var xhr = new XMLHttpRequest()
// xhr.open('GET', 'https://s3.cn-north-1.amazonaws.com.cn/api-release.modeloapp.com/prod/modeloapi-2.8-lts.js')
// xhr.send(null)
// xhr.onreadystatechange = function(e) {
//   if (xhr.status == 200 && xhr.readyState == 4) {
//     console.log(e)
//   }
// }
console.log(this)
registerPromiseWorker(message => {
  console.log('message', message)
  return Modelo.BIM.getElementProperties(message.modelId, message.name)
})
