require('use-strict');
var http = require('http');


/********** database server ***********/
var low = require('lowdb')
var FileSync = require('lowdb/adapters/FileSync')

var adapter = new FileSync('db.json');
var db = low(adapter);

db.defaults({ 
  A: {
    chisl: [],
    znam: []
  },
  B: {
    chisl: [],
    znam: []
  } 
  })
  .write();
/********** database server ***********/


/********** web sever *****************/
function answerGet(req,res){
  if (req.url == "" || req.url =="/"){
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end("Где-то тут вертится бот для вокнтактика. Где страница настроек -- не скажу :Р");
  }
}

http.createServer(function (req, res) {  
  if (req.url == "/getpairs"){
    var post = '';
    req.on('data', chunk => post += chunk);
    req.on('end', ()=>{
      var par = JSON.parse(post);
      var data = db.get(par.podgr).get(par.ch).value();
      res.end(JSON.stringify(data));
    });
  }
  
  if (req.url == "/setpairs"){
    var post = '';
    req.on('data', chunk => post += chunk);
    req.on('end', ()=>{
      var par = JSON.parse(post);
      db.get(par.podgr).set(par.ch, par.data).write();
      res.end('ok');
    });
  }
  
  if (req.url == "/znamtrigger"){
    isChisl = !isChisl;
    res.end("ok");
  }
  
  answerGet(req, res);
}).listen(process.env.PORT || 8080);
/********** web sever *****************/

/********* vk bot ********************/
var VK = require('node-vk-bot-api');
var api = require('vk-wrapper')
var vktoken = "токен доступа к профилю вконтакте (не группы)";
var bot = new VK({ token: vktoken });
var isChisl = true;

bot.hears('привет бот', (ctx) => {
  ctx.sendMessage(ctx.user_id, 'Чокак, бро?');
});

bot.hears('расписание', (ctx) => {
  ctx.sendMessage(ctx.user_id, 'http://newbotvk.azurewebsites.net/default.html Жми');
});

bot.hears('спасибо', (ctx) => {
  ctx.sendMessage(ctx.user_id, 'Не за что, бро :3');
});

bot.hears('тетрис', (ctx) => {
  ctx.sendMessage(ctx.user_id, 'http://crabnews.azurewebsites.net');
});

var arrZvonk = ["08:00-09:30", "09:40-11:10", '11:20-12:50', '13:50-15:20', '15:30-17:00', '17:10-18:40'];
bot.hears("какие пары сегодня", (context) => {
  var now = new Date();
  if (now.getDay() > 0){
    var dayIndex = now.getDay() - 1;
  } else {
    context.sendMessage(context.user_id, "Сегодня воскресенье");
    return;
  }
  if (isChisl){
    var ch = "chisl";
  } else {
    var ch = "znam";
  }
  var message = 'Подгруппа А:\n';
  var arrA = db.get("A").get(ch).value()[dayIndex];
  for (var i = 0; i < 6; i ++){
    if (arrA[i].replace(/ /g,'') != ''){
      message += `☠ ${i+1} || ${arrZvonk[i]} || ${arrA[i]}
      `;      
    }

  }
  message += "\nПодгруппа Б:\n";
  var arrB = db.get("B").get(ch).value()[dayIndex];
  for (var i = 0; i < 6; i ++){
    if (arrB[i].replace(/ /g,'') != ''){
      message += `✞ ${i+1} || ${arrZvonk[i]} || ${arrB[i]}
    `;
    }
  }
  context.sendMessage(context.user_id, message);
});

bot.hears("какие пары завтра", (context) => {
  var now = new Date();
  if (now.getDay() < 6){
    var dayIndex = now.getDay();
  } else {
    context.sendMessage(context.user_id, "Завтра воскресенье");
    return;
  }
  if (isChisl){
    var ch = "chisl";
  } else {
    var ch = "znam";
  }
  var message = 'Подгруппа А:\n';
  var arrA = db.get("A").get(ch).value()[dayIndex];
  for (var i = 0; i < 6; i ++){
    if (arrA[i].replace(/ /g,'') != ''){
      message += `☠ ${i+1} || ${arrZvonk[i]} || ${arrA[i]}
      `;      
    }

  }
  message += "\nПодгруппа Б:\n";
  var arrB = db.get("B").get(ch).value()[dayIndex];
  for (var i = 0; i < 6; i ++){
    if (arrB[i].replace(/ /g,'') != ''){
      message += `✞ ${i+1} || ${arrZvonk[i]} || ${arrB[i]}
    `;
    }
  }
  context.sendMessage(context.user_id, message);
});

bot.hears("справка бота", (context) => {
  context.sendMessage(context.user_id, 
    `Доступные для бота команды:
    
    • Привет бот
    • Какие пары сегодня/завтра
    • Справка бота
    • Числитель/знаменатель
    • Бот пост
    • Бот пейзаж
    • Мемос
    • Тетрис
    • Расписание (показывает страничку с полным расписанием)
    
    К регистру не чувствителен. Команды могут быть где-нибудь внутри сообщения.
    Если вы хотите какие-то новые функции боту. Пишите в лс создателю. Ну вы знаете.`);
});

bot.hears("числитель", (context) => {
  if (isChisl){
    context.sendMessage(context.user_id, "Числитель");
  } else {
    context.sendMessage(context.user_id, "Знаменатель");
  }
});

bot.hears("знаменатель", (context) => {
  if (isChisl){
    context.sendMessage(context.user_id, "Числитель");
  } else {
    context.sendMessage(context.user_id, "Знаменатель");
  }
});

bot.hears('танк', (ctx) => {
  ctx.sendMessage(ctx.user_id, 'Танковод -- не человек!');
});


function getRandomInt(min,max){
	return Math.floor(min + Math.random() * (max + 1 - min));
}

var newsGroups = ["-26478611", "-54530371", "-30666517"];
bot.hears('бот пост', (ctx) => {
  var gid = newsGroups[getRandomInt(0,newsGroups.length-1)];
  var options = {
    owner_id: gid,
    access_token: vktoken,
    count: 20,
    filter: "owner",
    v: "5.68"
  };
  api("wall.get", options).then(body=>{
    var posts = body.response.items;
    var post = posts[getRandomInt(0,19)];
    ctx.sendMessage(ctx.user_id, 'Да будет так!',"wall" + gid + "_" + post.id);
  });
});

var landscapeGroups = ["-57069145", "-41842105" ];
bot.hears("бот пейзаж", (ctx) => {
  var gid = landscapeGroups[getRandomInt(0,landscapeGroups.length - 1)];
  var options = {
    owner_id: gid,
    access_token: vktoken,
    count: 50,
    filter: "owner",
    v: "5.68"
  };
  api("wall.get", options).then(body=>{
    var posts = body.response.items;
    var post = posts[getRandomInt(0,49)];
    ctx.sendMessage(ctx.user_id, 'Да будет так!',"wall"  + gid + "_" + post.id);
  });
});

var memesGroups = ["-95648824","-45745333","-127065778","-126988526", "-72188644"];
bot.hears("мемос", (ctx) => {
  if (ctx.user_id > 2000000000){
    ctx.sendMessage(ctx.user_id, 'Только в лс, сорян :Р');
  } else {
    var gid = memesGroups[getRandomInt(0,landscapeGroups.length - 1)];
    var options = {
      owner_id: gid,
      access_token: vktoken,
      count: 100,
      filter: "owner",
      v: "5.68"
    };
    api("wall.get", options).then(body=>{
      var posts = body.response.items;
      var post = posts[getRandomInt(0,99)];
      ctx.sendMessage(ctx.user_id, 'Да будет так!',"wall" + gid + "_" + post.id);
    });
  }
});

bot.listen();

/********* vk bot ********************/