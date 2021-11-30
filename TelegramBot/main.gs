function debug(message) {
    if (cfg.bot.debugChatId) bot.sendMessage(cfg.bot.debugChatId, message);
}

function addDays(olddate, days) {
    var date = olddate;
    date.setDate(date.getDate() + days);
    return date;
};
var lastdate = 0;

function event() {
    return (
        "当前活动为Wacca联动限时梯子活动，" +
        difftime(2021, 7, 10, 8, 0, 0, 14.625) +
        "\n"
    );
}

function difftime(year, month, date, hour, minute, second, last) {
    if (hour == undefined) hour = 0;
    if (minute == undefined) minute = 0;
    if (second == undefined) second = 0;
    var mydate = Date.now();
    var temp = new Date(year, month, date, hour, minute, second);
    console.log(mydate);
    console.log(temp);
    var stime = Date.parse(new Date(mydate));
    var etime = Date.parse(new Date(temp));
    var endtime = etime + 24 * 60 * 60 * 1000 * last;
    var str = "";
    if (etime > stime) str = "距离活动开始还有";
    if (stime > etime && stime < endtime) str = "距离活动结束还有";

    if (stime > endtime) {
        var z = etime;
        etime = stime;
        stime = endtime;
        str = "已经结束了";
    }
    var usedTime = etime - stime; //两个时间戳相差的毫秒数
    if (stime > etime) usedTime = endtime - stime;
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    //计算出小时数
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000));
    var leave3 = leave2 % (60 * 1000);
    var seconds = leave3 / 1000;
    var time = str;
    if (days > 0)
        time += days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒";
    else if (hours > 0)
        time += hours + "小时" + minutes + "分钟" + seconds + "秒";
    else if (minutes > 0) time += minutes + "分钟" + seconds + "秒";
    else time += seconds + "秒";
    console.log(time);
    return time;
}

function difftime1(ts) {
    var mydate = Date.now();
    var temp = new Date(ts);
    console.log(mydate);
    console.log(temp);
    var stime = Date.parse(new Date(mydate));
    var etime = Date.parse(new Date(temp));
    var usedTime = stime - etime; //两个时间戳相差的毫秒数
    usedTime += 10000;
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    //计算出小时数
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000));
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000));
    var leave3 = leave2 % (60 * 1000);
    var seconds = leave3 / 1000;
    var time =
        days + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒" + "前";
    var flag = 1;
    if (days > 14) time = days + " days";
    else if (days > 0) {
        time = days + " day";
        if (days > 1) time += "s";
        time += " " + hours + " hour";
        if (hours > 1) time += "s";
    } else if (hours > 0) {
        time = hours + " hour";
        if (hours > 1) time += "s";
        time += " " + minutes + " minute";
        if (minutes > 1) time += "s";
    } else if (minutes > 0) {
        time = minutes + " minute";
        if (minutes > 1) time += "s";
        time += " " + seconds + " second";
        if (seconds > 1) time += "s";
    } else if (seconds > 0) {
        time = seconds + " second";
        if (seconds > 1) time += "s";
    } else {
        time = "just now";
        flag = 0;
    }
    if (flag == 1) time += " ago";
    console.log(time);
    return time;
}

function searchsong(name) {
    var albums = [
        "Arcaea",
        "AdversePrelude",
        "LuminousSky",
        "ViciousLabyrinth",
        "EternalCore",
        "AbsoluteReason",
        "BinaryEnfold",
        "AmbivalentVision",
        "CrimsonSolace",
        "CHUNITHM",
        "GrooveCoaster",
        "ToneSphere",
        "Lanota",
        "Stellights",
        "Dynamix",
        "MemoryArchive",
        "SunsetRadiance"
    ];
    if (songdbjson[name] == undefined) return undefined;
    var song = songdbjson[name];
    var name = song.en;
    var str = "Name: " + name;
    if (song["ja"] != null) str += "(" + song["ja"] + ")";
    str += "\r\nArtist: " + song["artist"] + "\r\n";
    str += "BPM: " + song["bpmrange"] + "\r\n";
    str += "Package: " + albums[song["package"]] + "\r\n";
    str +=
        "Difficulty: \r\nPast=" +
        song["rating"][0] +
        "(" +
        song["constant"][0] +
        ")\r\nPresent=" +
        song["rating"][1] +
        "(" +
        song["constant"][1] +
        ")\r\nFuture=" +
        song["rating"][2] +
        "(" +
        song["constant"][2] +
        ")";
    return str;
}

function getuserbytgid(tgid) {
    var response = UrlFetchApp.fetch(cfg.backend.Endpoint + "/getuser?tgid=" + tgid);
    return JSON.parse(response);
}

function updatescoreboard(originaltext, recent, debug) { // not used any more
    var Name = recent.match(/Name: (.*)\n/)[1];
    var playsong = recent.match(/Song: (.*)\n/)[1];
    var playdiffi = recent.match(/Difficulty: (.*)[\(()](.*)[\)()]\n/)[1];
    var Score = recent.match(/Score: (.*)[\(()](.*)[\)()]\n/)[1];
    var playptt = recent.match(/Play PTT: (.*)\n/)[1];
    var split = originaltext.split('\n');
    debug("Name:" + Name + "\nSong:" + playsong + "\ndifficulty:" + playdiffi + "\nscore:" + Score + "\nPTT:" + playptt);
    if (split[0].match(/Song:(.*)/)[1] != playsong)
        return undefined;
    var rddiffi = split[1].match(/Difficulty:(.*)/)[1];
    if (rddiffi == "ftr") rddiffi = "Future";
    if (rddiffi == "prs") rddiffi = "Present";
    if (rddiffi == "pst") rddiffi = "Past";
    if (rddiffi == "byd") rddiffi = "Beyond";
    if (rddiffi != playdiffi)
        return undefined;
    var inlist = -1;
    var dict = {};
    if (split.length > 3) {
        for (var x in split) {
            if (x < 3) continue;
            var temp = split[x].split(' ');
            var rank = temp[0];
            var name = temp[1];
            var score = temp[2];
            dict[name] = score;
        }
    }
    dict[Name] = Score;
    var items = Object.keys(dict).map(function(key) {
        return [key, dict[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    var newtext = split[0] + '\n' + split[1] + '\n' + split[2] + '\n';
    var rank = 1;
    for (var x in items) {
        newtext += rank + ' `' + items[x][0] + '` `' + items[x][1] + '`\n';
        rank++;
    }
    return newtext;
}

function Recent(uid) {
    var cleartypestr = [
        "TrackLost",
        "NormalClear",
        "FullRecall",
        "PureMemory",
        "EasyClear",
        "HardClear"
    ];
    var response = UrlFetchApp.fetch(cfg.backend.Endpoint + "/recent1?id=" + uid);
    var json = response.getContentText();
    var responseobj = JSON.parse(json);
    var name = responseobj.name;
    var rating = responseobj.rating / 100;
    var ratingstr = "" + rating;
    if (responseobj.rating == -1) ratingstr = "Hidden";
    if (responseobj.recent_score[0] == undefined)
        return (
            "Name: `" +
            name +
            "`\nUsercode: `" +
            uid +
            "`\nPTT: " +
            ratingstr +
            "\nRecent Play:\n你还没有在线打过歌，请开始你的表演!"
        );
    var recent = responseobj.recent_score[0];
    var difficulty = recent.difficulty;
    var diffstr = "Past";
    if (difficulty == 1) diffstr = "Present";
    else if (difficulty == 2) diffstr = "Future";
    else if (difficulty == 3) diffstr = "Beyond";
    var songid = recent.song_id;
    var songdetail = songdbjson[songid];
    var english = songid;
    if (songdetail != undefined)
        english = songdetail["en"];
    var songrating = 0;
    if (recent.score >= 10000000)
        songrating = recent.rating - 2;
    else if (recent.score >= 9800000)
        songrating = recent.rating - 1 - (recent.score - 9800000) / 200000;
    else if (recent.rating > 0)
        songrating = recent.rating - (recent.score - 9500000) / 300000;
    songrating = toDecimal2(songrating);
    if (songdetail != undefined)
        songrating = songdetail["constant"][difficulty];
    var playrating = recent.rating;
    var score = recent.score;
    var cleartype = recent.clear_type;
    var perfect = recent.perfect_count;
    var pperfect = recent.shiny_perfect_count;
    var far = recent.near_count;
    var miss = recent.miss_count;
    var timeplay = recent.time_played;
    var reply =
        "Name: " + name +
        "\nUsercode: `" + uid +
        "`\nPTT: " + ratingstr +
        "\nRecent Play:\nTime: " + difftime1(timeplay) +
        "\nSong: `" + english +
        "`\nDifficulty: " + diffstr + "(" + songrating + ")" +
        "\nPlay PTT: " + toDecimal2(playrating) +
        "\nScore: " + score + " (" + cleartypestr[cleartype] +
        ")\nPure: " + perfect + "(+" + pperfect +
        ")\nFar: " + far +
        "\nLost: " + miss;
    return reply;
}

function toDecimal2(x, y) {
    if (y == undefined) y = 2;
    var f = parseFloat(x);
    if (isNaN(f)) {
        return false;
    }
    var ten = 1;
    for (var i = 0; i < y; ++i) ten = ten * 10;
    var f = Math.round(x * ten) / ten;
    var s = f.toString();
    var rs = s.indexOf(".");
    if (rs < 0) {
        rs = s.length;
        s += ".";
    }
    while (s.length <= rs + y) {
        s += "0";
    }
    return s;
}

function pttranklist(page, cache, maxpage, arcaeaname) { //already disable
    var extendurl = "";
    if (cache != undefined) extendurl = "cache";
    var pttranklistjson = JSON.parse(
        UrlFetchApp.fetch(
            cfg.backend.Endpoint + "/pttranklist" + extendurl
        ).getContentText()
    );
    var rank = 1;
    var x;
    var y;
    var res = "";
    var lastone = 0;
    var realrank = 1;
    var lastrank = 0;
    var specialrank = -1;
    for (y in pttranklistjson) {
        x = pttranklistjson[y];
        x["ptt"] = toDecimal2(x["ptt"]);
        if (x["ptt"] == lastone) realrank = lastrank;
        else realrank = rank;
        res += realrank;
        if (realrank < 10) res += " ";
        res += "\t";
        if (x["ptt"] < 10) res += " ";
        res += x["ptt"];
        res += "\t" + x["name"];
        if (arcaeaname != undefined && x["name"] == arcaeaname) {
            page = (rank - 1) / 10 + 1;
            specialrank = rank;
        }
        if (realrank == 1) res += " 🏅️";
        else if (realrank == 2) res += " 🥈";
        else if (realrank == 3) res += " 🥉";
        res += "\n";
        lastrank = realrank;
        lastone = x["ptt"];
        rank++;
    }
    if (page == undefined) return res;
    var list = res.split("\n");
    var count = list.length;
    var allpage = Math.ceil(count / 10);
    if (maxpage != undefined) maxpage.value = allpage;
    if (page < 1) page = 1;
    if (page > allpage) page = allpage;
    var pageres = "";
    var start = (page - 1) * 10;
    for (var q = 0; q < 10 && start + q < count; q++) {
        if (start + q != specialrank)
            pageres += "`" + list[start + q] + "`\n";
        else
            pageres += "`" + list[start + q] + "`★\n";
    }
    pageres += "" + page + "/" + allpage + "\n";
    return pageres;
}

function best30(usercode, ingroup) {
    var best30json = JSON.parse(
        UrlFetchApp.fetch(
            cfg.backend.Endpoint + "/best30" + "?usercode=" + usercode
        ).getContentText()
    );
    if (best30json == "error")
        return null;
    var rank = 1;
    var x;
    var y;
    var res = "";
    var lastone = 0;
    var realrank = 1;
    var lastrank = 0;
    var specialrank = -1;
    var best30list = best30json.best30;
    var avg30 = 0.0;
    best30list.sort(function(a, b) {
        return b.rating - a.rating
    });
    for (y in best30list) {
        x = best30list[y];
        x["rating"] = toDecimal2(x["rating"], 4)
        if (x["rating"] == lastone) realrank = lastrank;
        else realrank = rank;
        res += realrank;
        if (realrank < 10) res += " ";
        res += " ";
        if (songdbjson[x["songid"]] == undefined)
            res += " " + x["songid"];
        else
            res += " " + songdbjson[x["songid"]].en;
        if (x["difficulty"] == "present") res += "(prs)";
        else if (x["difficulty"] == "past") res += "(pst)";
        else if (x["difficulty"] == "beyond") res += "(byd)";
        res += " `" + x["score"] + "`";
        res += " ";
        res += "`" + x["rating"] + "`";
        res += "\n";
        lastrank = realrank;
        lastone = x["rating"];
        rank++;
    }
    var list = res.split("\n");
    var count = list.length;
    var pageres = "";
    pageres += "Best30 average:`" + toDecimal2(best30json["avg_30"], 4) + "`\n";
    pageres += "Recent average:`" + toDecimal2(best30json["avg_recent"], 4) + "`\n";
    var outputcount = count;
    if (count > 10 && ingroup == true) {
        outputcount = 10;
    }
    for (var q = 0; q < outputcount; q++) {
        pageres += list[q] + "\n";
    }
    if (outputcount < count && ingroup == true) { // in group chat, only show top 10 and last 2 of 30
        pageres += "......\n";
        pageres += list[count - 2] + "\n";
    }
    return pageres;
}

function songranklist(songid, difficulty, world) { // already disabled
    if (difficulty == undefined) difficulty = "2";
    var json = "";
    if (world == undefined)
        json = UrlFetchApp.fetch(
            cfg.backend.Endpoint + "/songranklist?songid=" +
            songid +
            "&difficulty=" +
            difficulty
        ).getContentText();
    else
        json = UrlFetchApp.fetch(
            cfg.backend.Endpoint + "/world?songid=" +
            songid +
            "&difficulty=" +
            difficulty
        ).getContentText();
    var songranklistjson = JSON.parse(json);
    var difficultystr = ["past", "present", "future"];
    if (difficulty == "0" || difficulty == "1" || difficulty == "2")
        difficulty = difficultystr[difficulty];
    var constant = 0.0;
    if (difficulty == "past") constant = songdbjson[songid]["constant"][0];
    else if (difficulty == "present")
        constant = songdbjson[songid]["constant"][1];
    else if (difficulty == "future")
        constant = songdbjson[songid]["constant"][2];
    else if (difficulty == "beyond")
        constant = songdbjson[songid]["constant"][3];
    var res =
        "`Song: " +
        songdbjson[songid].en +
        "`\r\n`Difficulty: " +
        difficulty +
        "(" +
        constant +
        ")`\r\n";
    var x;
    var y;
    var rank = 1;
    var lastone = 0;
    var realrank = 1;
    var lastrank = 0;
    for (y in songranklistjson) {
        x = songranklistjson[y];
        if (x["score"] == lastone) realrank = lastrank;
        else realrank = rank;
        res += "`";
        res += realrank;
        if (realrank < 10) res += " ";
        res += "\t" + x["name"];
        res += "\t" + x["score"];
        if (x["rating"] != undefined) res += "\t" + x["rating"].toFixed(2);
        res += "`\r\n";
        lastrank = realrank;
        lastone = x["score"];
        rank++;
    }
    return res;
}

function calculaterating(rating, score) {
    if (score >= 10000000) return rating + 2;
    else if (score > 9800000) return rating + 1 + (score - 9800000) / 200000;
    else return Math.max(0, rating + (score - 9500000) / 300000.0);
}

function calculatescore(rating, ptt) {
    if (ptt == rating + 2) return 10000000;
    else if (ptt >= rating + 1) return (ptt - rating - 1) * 200000 + 9800000;
    else return (ptt - rating) * 300000 + 9500000;
}

function getuserbest(uid, songid, difficulty) {
    var cleartypestr = [
        "TrackLost",
        "NormalClear",
        "FullRecall",
        "PureMemory",
        "EasyClear",
        "HardClear"
    ];
    var response = UrlFetchApp.fetch(
        cfg.backend.Endpoint + "/getuserscore?userid=" +
        uid +
        "&songid=" +
        songid +
        "&difficulty=" +
        difficulty
    );
    var json = response.getContentText();
    if (json == "noplay") return "你还没打这首歌的该难度!";
    var responseobj = JSON.parse(json);
    var name = responseobj.name;
    var recent = responseobj;
    var difficulty = recent.difficulty;
    var diffstr = "Past";
    if (difficulty == 1) diffstr = "Present";
    else if (difficulty == 2) diffstr = "Future";
    else if (difficulty == 3) diffstr = "Beyond";
    var songid = recent.song_id;
    var songdetail = songdbjson[songid];
    var english = songdetail["en"];
    var songrating = songdetail["constant"][difficulty];
    var score = recent.score;
    var playrating = calculaterating(songrating, score);

    var cleartype = recent.clear_type;
    var perfect = recent.perfect_count;
    var pperfect = recent.shiny_perfect_count;
    var far = recent.near_count;
    var miss = recent.miss_count;
    var timeplay = recent.time_played;
    var reply =
        "Name: " + name +
        "\nUsercode: `" + uid +
        "`\nBest Play:\nTime: " + difftime1(timeplay) +
        "\nSong: `" + english +
        "`\nDifficulty: " + diffstr + "(" + songrating + ")" +
        "\nPlay PTT: " + toDecimal2(playrating) +
        "\nScore: " + score + " (" + cleartypestr[cleartype] +
        ")\nPure: " + perfect + "(+" + pperfect +
        ")\nFar: " + far +
        "\nLost: " + miss;
    return reply;
}

function testsongranklist() {
    var messageText = "/songranklist singularity 2";
    messageText = messageText.replace(/\s+/, " ");
    var query = messageText.split(" ");
    console.log(messageText);
    console.log(query[0]);
    console.log(query[1]);
    console.log(query[2]);
}

function getsongidfromsongname(songname, songdbjson) {
    var x;
    for (x in songdbjson) {
        if (songdbjson[x].en == songname) return x;
    }
    return undefined;
}

function Register(tgid, arcaeaid) {
    return UrlFetchApp.fetch(
        cfg.backend.Endpoint + "/adduser?tgid=" + tgid + "&" + "id=" + arcaeaid
    ).getContentText();
}

function getsongdbjson() {
    return JSON.parse(
        UrlFetchApp.fetch(cfg.backend.Endpoint + "/songdb").getContentText()
    );
}
var songdbjson = getsongdbjson();
var tgid2uid = JSON.parse(UrlFetchApp.fetch(cfg.backend.Endpoint + "/tgid2uid").getContentText());

function getsongidfromalias(alias) {
    var aliaslist = JSON.parse(UrlFetchApp.fetch(cfg.backend.Endpoint + "/getalias").getContentText());
    return aliaslist[alias];
}

function checksongname(query) {
    var arg = "";
    if (query.length == 1) return "";
    for (var i = 1; i < query.length; i++)
        arg += " " + query[i];
    arg = arg.toLowerCase().trim();
    if (arg in songdbjson)
        return arg;
    for (var songid in songdbjson) {
        if (songdbjson[songid].ja != null && songdbjson[songid].ja.toLowerCase() == arg)
            return songid;
        else if (songdbjson[songid].en.toLowerCase() == arg)
            return songid;
    }
    return undefined;
}

function parsedifficulty(difficulty) {
    difficulty = difficulty.toLowerCase();
    if (difficulty == "pst" || difficulty == "past" || parseInt(difficulty) == 0)
        return 0;
    if (difficulty == "prs" || difficulty == "present" || parseInt(difficulty) == 1)
        return 1;
    if (difficulty == "ftr" || difficulty == "future" || parseInt(difficulty) == 2)
        return 2;
    if (difficulty == "byd" || difficulty == "beyond" || parseInt(difficulty) == 3)
        return 3;
    return undefined;
}

function initBot() {
    this.bot = new Bot(cfg.bot.token);
    bot.on("message", function(message) {
        if (message.forward_date != undefined)
            return;
        var messageText = message.text.replace("@" + cfg.bot.name, "").trim();
        messageText = messageText.replace(/\s+/, " ");
        if (messageText[0] != "/") return;
        var query = messageText.split(" ");
        var messageid = message.message_id;
        var senddebug = function(m) {
            bot.sendMessage(properties['debugChatId'], m);
        }
        console.log(messageText);
        query[0] = query[0].toLowerCase();
        var chatdetail = "In chat " + message.chat.id + "(" + message.chat.title + " @" + message.chat.username + ")" + ", from " + message.from.id + "(@" + message.from.username + ")";
        if (query.length == 1) {
            bot.sendMessage(
                properties['debugChatId'],
                chatdetail +
                " post:" +
                messageText
            );
        } else {
            var s = "";
            for (var i = 1; i < query.length; ++i) {
                s += " " + query[i];
            }
            bot.sendMessage(
                properties['debugChatId'],
                chatdetail +
                " post:" +
                query[0] +
                " with query:" +
                s
            );
        }
        if (messageText.match(/^\/start$/))
            bot.sendMessage(message.chat.id, cfg.msg.start);
        else if (messageText.match(/^\/ping$/)) {
            var senttime = message.date;
            var now = Date.now();
            var ping = JSON.parse(
                UrlFetchApp.fetch(cfg.backend.Endpoint + "/ping?time1=" + senttime + "&time2=" + now).getContentText()
            );
            if (ping["status"] == "success")
                bot.sendMessage(message.chat.id, "我醒着呢！", {
                    reply_to_message_id: messageid
                });
        }
        //帮助信息
        else if (messageText.match(/^\/help$/))
            bot.sendMessage(message.chat.id, cfg.msg.help);
        //查活动
        else if (messageText.match(/^\/event$/))
            bot.sendMessage(message.chat.id, event(), {
                reply_to_message_id: messageid
            });
        else if (query[0] == "/rd" || query[0] == "/random" || query[0] == "/roll") {
            var low = 0;
            var high = 12;
            if (query.length > 1)
                low = parseFloat(query[1]);
            if (query.length > 2)
                high = parseFloat(query[2]);
            if (low > high) {
                var t = low;
                low = high;
                high = t;
            }
            var songlist = [];
            var difficulty = ["Past", "Present", "Future", "Beyond"];
            for (var song in songdbjson) {
                var len = songdbjson[song].constant.length;
                for (var i = 0; i < len; i++) {
                    var songconstant = songdbjson[song].constant[i];
                    if (songconstant >= low && songconstant <= high)
                        songlist.push([songdbjson[song].en, songconstant, difficulty[i]]);
                }
            }
            if (songlist.length == 0)
                bot.sendMessage(message.chat.id, "没有这样的歌！", {
                    reply_to_message_id: messageid,
                    parse_mode: "Markdown"
                });
            else {
                var rdsong = songlist[Math.floor((Math.random() * songlist.length))];
                bot.sendMessage(message.chat.id, "Song:" + rdsong[0] + "\r\nDifficulty:" + rdsong[2] + "\r\nConstant:" + rdsong[1], {
                    reply_to_message_id: messageid,
                    parse_mode: "Markdown"
                });
            }
        } else if (query[0] == '/pttcal') {
            if (query.length < 2) {
                bot.sendMessage(message.chat.id, "至少给我个名字和分数啊！", {
                    reply_to_message_id: messageid,
                    parse_mode: "Markdown"
                });
            } else {
                var songid = undefined;
                if (songdbjson[query[1]] != undefined) songid = query[1];
                if (songid == undefined) songid = getsongidfromalias(query[1]);
                if (songid == undefined) bot.sendMessage(message.chat.id, "我不认得这个歌名(只支持songid和alias)", {
                    reply_to_message_id: messageid,
                    parse_mode: "Markdown"
                });
                else {
                    var difficulty = 2;
                    var post = function(constant) {
                        return "没告诉我分数，那我告诉你参考ptt:\r\n\
`score>=10000000 ptt=" + (constant + 2).toString() + "`\r\n\
`score=9900000 ptt=" + (constant + 1.5).toString() + "`\r\n\
`score=9800000 ptt=" + (constant + 1).toString() + "`\r\n\
`score=9650000 ptt=" + (constant + 0.5).toString() + "`\r\n\
`score=9500000 ptt=" + (constant).toString() + "`\r\n\
`score=9200000 ptt=" + (constant - 1).toString() + "`\r\n\
`score<=" + (9500000 - constant * 300000).toString() + " ptt=0`\r\n";
                    };
                    if (query.length >= 3 && parsedifficulty(query[2]) != undefined) {
                        if (parsedifficulty(query[2]) == 3 && songdbjson[songid].constant.length == 3)
                            bot.sendMessage(message.chat.id, "该曲子没有beyond难度", {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        else {
                            difficulty = parsedifficulty(query[2]);
                            var constant = songdbjson[songid].constant[difficulty];
                            if (query.length == 3) //pttcal {song} {difficulty}
                            {
                                bot.sendMessage(message.chat.id, post(constant), {
                                    reply_to_message_id: messageid,
                                    parse_mode: "Markdown"
                                });
                            } else //pttcal {song} {difficulty} {score}
                            {
                                var score = parseFloat(query[3]);
                                if (score != undefined && score > constant + 2) {
                                    bot.sendMessage(message.chat.id, "`这个分数对应的ptt是" + toDecimal2(calculaterating(constant, score)) + "`", {
                                        reply_to_message_id: messageid,
                                        parse_mode: "Markdown"
                                    });
                                } else if (score != undefined && score >= 0 && score <= constant + 2) {
                                    bot.sendMessage(message.chat.id, "`这个ptt对应的score是" + toDecimal2(calculatescore(constant, score)) + "`", {
                                        reply_to_message_id: messageid,
                                        parse_mode: "Markdown"
                                    });
                                } else {
                                    bot.sendMessage(message.chat.id, "这分数我看不懂！", {
                                        reply_to_message_id: messageid,
                                        parse_mode: "Markdown"
                                    });
                                }
                            }
                        }
                    } else {
                        constant = songdbjson[songid].constant[2];
                        if (query.length == 2) //pttcal {song}
                        {
                            bot.sendMessage(message.chat.id, post(constant), {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        } else //pttcal {song} {score}
                        {
                            var score = parseFloat(query[2]);
                            if (score != undefined && score > constant + 2) {
                                bot.sendMessage(message.chat.id, "`这个分数对应的ptt是" + toDecimal2(calculaterating(constant, score)) + "`", {
                                    reply_to_message_id: messageid,
                                    parse_mode: "Markdown"
                                });
                            } else if (score != undefined && score >= 0 && score <= constant + 2) {
                                bot.sendMessage(message.chat.id, "`这个ptt对应的score是" + toDecimal2(calculatescore(constant, score)) + "`", {
                                    reply_to_message_id: messageid,
                                    parse_mode: "Markdown"
                                });
                            } else {
                                bot.sendMessage(message.chat.id, "这分数我看不懂！", {
                                    reply_to_message_id: messageid,
                                    parse_mode: "Markdown"
                                });
                            }
                        }
                    }
                }
            }
        }
        } else if (query[0] == "/best30") {
                var ingroup = false;
                if (message.chat.type != "private") {
                    ingroup = true;
                }
                var tgid = message.from.id;
                if(message.reply_to_message != undefined)
                {
                  if(tgid2uid[message.reply_to_message.from.id] == undefined)
                  {
                    bot.sendMessage(message.chat.id, "该用户未绑定该bot", {
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown"
                        });
                    return;
                  }
                  else
                  {
                    tgid = message.reply_to_message.from.id;
                  }
                }
                if (tgid2uid[tgid] != undefined) {
                    var usercode = tgid2uid[tgid];
                    var res = best30(usercode, ingroup);
                    if (res == null) {
                        bot.sendMessage(message.chat.id, "查询失败", {
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown"
                        });
                    } else {
                        bot.sendMessage(message.chat.id, res, {
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown"
                        });
                    }
                } else {
                    bot.sendMessage(message.chat.id, "未绑定", {
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown"
                    });
                }
        } else if (query[0] == "/my" || query[0] == "/bestplay" || query[0] == "/bp") {
            var replyflag = 0;
            if (message.reply_to_message != undefined) { // this message is replying another message
                var replytext = message.reply_to_message.text;
                var songname;
                var difficultname;
                if (replytext.match(/[sS]ong: `(.*)`/)) {
                    songname = replytext.match(/[sS]ong: `(.*)`/)[1];
                    var songid = getsongidfromsongname(songname, songdbjson);
                    difficultname = "future";
                    if (replytext.match(/future|past|present|beyond/i))
                        difficultname = replytext
                        .match(/future|past|present|beyond/i)[0]
                        .toLowerCase();
                    var msg = getuserbest(tgid2uid[message.from.id], songid, difficultname);
                    if (msg == "你还没打这首歌的该难度!") {
                        var firstname = message.from.first_name;
                        var lastname = message.from.last_name;
                        if (lastname == undefined) lastname = "";
                        var fullname = firstname + ' ' + lastname;
                        msg = "To <a href = 'tg://user?id=" + message.from.id + "'>" + fullname + "</a>:" + msg;
                        bot.sendMessage(message.chat.id, msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "HTML"
                        });
                    } else {
                        if (songphotos[songid] != null) {
                            bot.sendPhoto(message.chat.id, songphotos[songid], {
                                caption: msg,
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown",
                            });
                        } else {
                            bot.sendMessage(message.chat.id, msg, {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        }
                    }
                    replyflag = 1;
                } else if (replytext.length < 50 && getsongidfromsongname(replytext, songdbjson)) {
                    songid = getsongidfromsongname(replytext, songdbjson);
                    difficultname = "future";
                    var msg = getuserbest(tgid2uid[message.from.id], songid, difficultname);
                    if (msg == "你还没打这首歌的该难度!") {
                        var firstname = message.from.first_name;
                        var lastname = message.from.last_name;
                        if (lastname == undefined) lastname = "";
                        var fullname = firstname + ' ' + lastname;
                        msg = "To <a href = 'tg://user?id=" + message.from.id + "'>" + fullname + "</a>:" + msg;
                        bot.sendMessage(message.chat.id, msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "HTML"
                        });
                    } else {
                        if (songphotos[songid] != null) {
                            bot.sendPhoto(message.chat.id, songphotos[songid], {
                                caption: msg,
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown",
                            });
                        } else {
                            bot.sendMessage(message.chat.id, msg, {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        }
                    }
                    replyflag = 1;
                } else if (replytext.length < 50 && songdbjson[replytext] != undefined) {
                    difficultname = "future";
                    var msg = getuserbest(tgid2uid[message.from.id], replytext, difficultname);
                    if (msg == "你还没打这首歌的该难度!") {
                        var firstname = message.from.first_name;
                        var lastname = message.from.last_name;
                        if (lastname == undefined) lastname = "";
                        var fullname = firstname + ' ' + lastname;
                        msg = "To <a href = 'tg://user?id=" + message.from.id + "'>" + fullname + "</a>:" + msg;
                        bot.sendMessage(message.chat.id, msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "HTML"
                        });
                    } else {
                        if (songphotos[songid] != null) {
                            bot.sendPhoto(message.chat.id, songphotos[songid], {
                                caption: msg,
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown",
                            });
                        } else {
                            bot.sendMessage(message.chat.id, msg, {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        }
                    }
                    replyflag = 1;
                }
            }
            if (replyflag == 0) {
                var alias = JSON.parse(
                    UrlFetchApp.fetch(cfg.backend.Endpoint + "/getalias").getContentText()
                );
                if (query[1] != undefined && alias[query[1]] != undefined)
                    query[1] = alias[query[1]];
                if (query[2] != undefined) {
                    query[2] = query[2].toLowerCase();
                    if (query[2] == "ftr") query[2] = "future";
                    if (query[2] == "prs") query[2] = "present";
                    if (query[2] == "pst") query[2] = "past";
                    if (query[2] == "byd") query[2] = "beyond";
                }
                if (
                    query.length < 2 ||
                    songdbjson[query[1].toLowerCase()] == undefined
                ) {
                    bot.sendMessage(message.chat.id, "无效songid", {
                        reply_to_message_id: messageid
                    });
                } else if (
                    query.length == 3 &&
                    ((query[2] != "0" && query[2] != "1" && query[2] != "2" && query[2] != "3" &&
                            query[2] != "past" && query[2] != "present" && query[2] != "future" && query[2] != "beyond") ||
                        ((query[2] == "beyond" || query[2] == "3") && songdbjson[query[1].toLowerCase()]["constant"][3] == null)))
                    bot.sendMessage(message.chat.id, "无效难度", {
                        reply_to_message_id: messageid
                    });
                else {
                    if (query.length == 2 && query[1] != undefined) query[2] = "future";
                    var msg = getuserbest(tgid2uid[message.from.id], query[1], query[2]);
                    if (msg == "你还没打这首歌的该难度!") {
                        var firstname = message.from.first_name;
                        var lastname = message.from.last_name;
                        if (lastname == undefined) lastname = "";
                        var fullname = firstname + ' ' + lastname;
                        msg = "To <a href = 'tg://user?id=" + message.from.id + "'>" + fullname + "</a>:" + msg;
                        bot.sendMessage(message.chat.id, msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "HTML"
                        });
                    } else{
                        if (songphotos[query[1]] != null) {
                            bot.sendPhoto(message.chat.id, songphotos[query[1]], {
                                caption: msg,
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown",
                            });
                        } else {
                            bot.sendMessage(message.chat.id, msg, {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            });
                        }
                    }
                }
            }
        }
        //查最近打歌记录
        else if (query[0].match(/^\/recent$/)) {
            if (query.length >= 2 && query[1].match(/^[0-9]{9}$/)) {
                var msg = Recent(query[1].match(/^[0-9]{9}$/)[0]);
                var ss = msg.match(/[sS]ong: `(.*)`/)[1];
                var songid = getsongidfromsongname(ss, songdbjson);
                if (songphotos[songid] != null) {
                    bot.sendPhoto(message.chat.id, songphotos[songid], {
                        caption: msg,
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown",
                        /*reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{
                                    text: "查看我这首最高分",
                                    callback_data: "showuserscore&" + songid + "&" + difficultname
                                }]
                            ]
                        })*/
                    });
                } else {
                    bot.sendMessage(
                        message.chat.id,
                        msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown"
                        }
                    );
                }
            } else if (message.reply_to_message != undefined) {
              if(tgid2uid[message.reply_to_message.from.id] == undefined)
              {
                bot.sendMessage(message.chat.id,
                        "该用户未绑定该bot", {
                            reply_to_message_id: messageid
                        });
                return;
              }
                var msg = Recent(tgid2uid[message.reply_to_message.from.id]);
                var difficultname = msg.match(/future|past|present|beyond/i)[0].toLowerCase();
                var userid = tgid2uid[message.reply_to_message.from.id];
                var ss = msg.match(/[sS]ong: `(.*)`/)[1];
                var songid = getsongidfromsongname(ss, songdbjson);
                if (songphotos[songid] != null) {
                    bot.sendPhoto(message.chat.id, songphotos[songid], {
                        caption: msg,
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown",
                        /*reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{
                                    text: "查看我这首最高分",
                                    callback_data: "showuserscore&" + songid + "&" + difficultname
                                }]
                            ]
                        })*/
                    });
                } else {
                    bot.sendMessage(message.chat.id, msg, {
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown",
                        /*reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [{
                                    text: "查看我这首最高分",
                                    callback_data: "showuserscore&" + songid + "&" + difficultname
                                }]
                            ]
                        })*/
                    });
                }
            } else {
                if (tgid2uid[message.from.id] == undefined)
                    bot.sendMessage(
                        message.chat.id,
                      "我不认识你，请先用 /register 绑定你的arcaea id\n例如: /register 123456789", {
                            reply_to_message_id: messageid
                        }
                    );
                else {
                    var msg = Recent(tgid2uid[message.from.id]);
                    var ss = msg.match(/[sS]ong: `(.*)`/)[1];

                    var difficultname = msg
                        .match(/future|past|present|beyond/i)[0]
                        .toLowerCase();
                    var songid = getsongidfromsongname(ss, songdbjson);
                    var userid = tgid2uid[message.from.id];
                    if (songphotos[songid] != null) {
                        bot.sendPhoto(message.chat.id, songphotos[songid], {
                            caption: msg,
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown",
                            /*reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{
                                        text: "查看我这首最高分",
                                        callback_data: "showuserscore&" + songid + "&" + difficultname
                                    }]
                                ]
                            })*/
                        });
                    } else {
                        bot.sendMessage(message.chat.id, msg, {
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown",
                            /*reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [{
                                        text: "查看我这首最高分",
                                        callback_data: "showuserscore&" + songid + "&" + difficultname
                                    }]
                                ]
                            })*/
                        });
                    }
                }
            }
        }
        else if (query[0] == "/register") { // bind telegram with arcaea account
            bot.sendMessage(
                properties['debugChatId'],
                "用户" + message.from.id + "发送register with query: " + query[1]
            );
            if (tgid2uid[message.from.id] != undefined)
                bot.sendMessage(
                    message.chat.id,
                    "你已经绑定过`" +
                    tgid2uid[message.from.id] +
                    "`了，如果需要改绑定，请联系 @mathlover ", {
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown"
                    }
                );
            else if (query.length < 2)
                bot.sendMessage(
                    message.chat.id,
                    "你不告诉我你的Arcaeaid，我怎么帮你绑定啊", {
                        reply_to_message_id: messageid
                    }
                );
            else if (query[1].match(/^[0-9]{9}$/) == null) {
                bot.sendMessage(message.chat.id, "arcaeaid是9位数字的哦！", {
                    reply_to_message_id: messageid
                });
            } else {
                bot.sendMessage(
                    properties['debugChatId'],
                    "用户" + message.from.id + "需要绑定arcaeaid:" + query[1]
                );
                try {
                    var response = JSON.parse(Register(message.from.id, query[1]));
                    if (response["status"] == "fail")
                        bot.sendMessage(
                            message.chat.id,
                            "Arcaea账号不存在，你是不是手抖了？", {
                                reply_to_message_id: messageid
                            }
                        );
                } catch (err) {
                    bot.sendMessage(
                        properties['debugChatId'],
                        err, {
                            parse_mode: "Markdown"
                        }
                    );
                } {
                    var recentstr = Recent(query[1]);
                    var ss = recentstr.match(/[sS]ong: `(.*)`/)[1];
                    var songid = getsongidfromsongname(ss, songdbjson);
                    if (songphotos[songid] != null) {
                        bot.sendPhoto(message.chat.id, songphotos[songid], {
                            caption: "绑定成功！下面是你的Arcaea账号信息：\r\n" + recentstr,
                            reply_to_message_id: messageid,
                            parse_mode: "Markdown",
                        });
                    } else {
                        bot.sendMessage(
                            message.chat.id,
                            "绑定成功！下面是你的Arcaea账号信息：\r\n" + recentstr, {
                                reply_to_message_id: messageid,
                                parse_mode: "Markdown"
                            }
                        );
                    }
                    var str = "用户" + message.from.id;
                    if (message.from.username != undefined)
                        str += "(@" + message.from.username + ")";
                    else str += "(" + message.from.first_name + ")";
                    bot.sendMessage(
                        properties['debugChatId'],
                        str + "绑定arcaea账号成功:" + query[1] + "\n" + recentstr, {
                            parse_mode: "Markdown"
                        }
                    );
                }
            }
        } else if (messageText.match(/^\/delalias/)) {
            if (
                message.from.id != properties['debugChatId'] &&
                message.from.id != "423268712" &&
                message.from.id != "778665268" &&
                message.from.id != "233460755" &&
                message.from.id != "227573165"
            ) {
                bot.sendMessage(message.chat.id, "只能让 @mathlover 删除alias哦！", {
                    reply_to_message_id: messageid
                });
            } else if (query.length < 2) {
                bot.sendMessage(message.chat.id, "你不告诉要删除的alias是为难我嘛", {
                    reply_to_message_id: messageid
                });
            } else {
                var back = UrlFetchApp.fetch(
                    cfg.backend.Endpoint + "/delalias?alias=" + query[1]
                ).getContentText();
                if (back == "Done!")
                    bot.sendMessage(
                        message.chat.id,
                        "我已经忘记" + query[1] + "这个alias啦！", {
                            reply_to_message_id: messageid
                        }
                    );
                else if (back == "No such alias!") {
                    bot.sendMessage(message.chat.id, "我怎么不记得有这个alias呢？", {
                        reply_to_message_id: messageid
                    });
                }
            }
        } else if (messageText.match(/^\/alias/)) { //add alias
            if (message.from.id != properties['debugChatId']) {
                bot.sendMessage(message.chat.id, "只能让 @mathlover 添加alias哦！", {
                    reply_to_message_id: messageid
                });
            } else if (query.length < 3) {
                bot.sendMessage(
                    message.chat.id,
                    "需要两个参数，一个是要添加的alias，一个是songid！", {
                        reply_to_message_id: messageid
                    }
                );
            } else if (songdbjson[query[2]] == undefined) {
                bot.sendMessage(message.chat.id, "songid不存在！", {
                    reply_to_message_id: messageid
                });
            } else {
                var back = UrlFetchApp.fetch(
                    cfg.backend.Endpoint + "/alias?alias=" +
                    query[1] +
                    "&songid=" +
                    query[2]
                ).getContentText();
                if (back == "Done!")
                    bot.sendMessage(
                        message.chat.id,
                        "alias添加成功！以后可以通过" +
                        query[1] +
                        "来查询歌曲" +
                        songdbjson[query[2]].en, {
                            reply_to_message_id: messageid
                        }
                    );
                else if (back == "alias exist!") {
                    var alias = JSON.parse(
                        UrlFetchApp.fetch(cfg.backend.Endpoint + "/getalias").getContentText()
                    );
                    bot.sendMessage(
                        message.chat.id,
                        "alias已经存在，指向" + songdbjson[alias[query[1]]].en, {
                            reply_to_message_id: messageid
                        }
                    );
                } else
                    bot.sendMessage(
                        message.chat.id,
                        "alias添加失败！@mathlover 快去debug！", {
                            reply_to_message_id: messageid
                        }
                    );
            }
        } else if (query[0] == "/getalias") {
            var alias = JSON.parse(
                UrlFetchApp.fetch(cfg.backend.Endpoint + "/getalias").getContentText()
            );

            if (query[1] == undefined)
                bot.sendMessage(message.chat.id, "给我个songid啊喂！", {
                    reply_to_message_id: messageid
                });
            else {
                var res = checksongname(query);
                if (res != undefined)
                    query[1] = res;
                if (alias[query[1]] != undefined) query[1] = alias[query[1]];
                var x;
                var y = 0;
                var msg = "songid: `" + query[1] + "`\r\nen: `" + songdbjson[query[1]].en + "`\r\n";
                if (songdbjson[query[1]].ja != null)
                    msg += "jp: `" + songdbjson[query[1]].ja + "`\r\n";

                var label = "";
                for (x in alias)
                    if (alias[x] == query[1]) {
                        y = 1;
                        label += "`" + x + "`\n";
                    }
                if (y == 0)
                    bot.sendMessage(message.chat.id, msg + "这首歌没有alias", {
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown"
                    });
                else {
                    bot.sendMessage(message.chat.id, msg + "这首歌的alias有:\n" + label, {
                        reply_to_message_id: messageid,
                        parse_mode: "Markdown"
                    });
                }
            }
        }
    });

    //inline query部分
    bot.on("inline_query", function(query) {
        var results = [];
        if (
            (query.query != "" && !isNaN(query.query)) ||
            (query.query == "" && tgid2uid[query.from.id] != undefined)
        ) {
            var id = "";
            if (query.query == "") id = tgid2uid[query.from.id];
            else id = query.query;
            if (id.match(/^[0-9]{9}$/)) {
                results.push({
                    type: "article",
                    id: "result1",
                    title: "查询最近打歌记录",
                    input_message_content: {
                        message_text: Recent(id),
                        parse_mode: "Markdown"
                    }
                });
            }
        }
        results.push({
            type: "article",
            id: "result2",
            title: "查询当前限时活动",
            input_message_content: {
                message_text: event(),
                parse_mode: "HTML"
            }
        });
        var res = bot.answerInlineQuery(query.id, results, {
            cache_time: 0,
            is_personal: true
        });
    });
    bot.on("callback_query", function(query) {
        var callbackid = query.id;
        var messageid = query.message.message_id;
        var chatid = query.message.chat.id;
        var message = query.message;
        var from = query.from.id;
        var data = query.data;
        var dataquery = data.split("&");
        var command = dataquery[0];
        var chatdetail = "In chat " + message.chat.id + "(" + message.chat.title + " @" + message.chat.username + ")" + ", from " + query.from.id + "(@" + query.from.username + ")";
        bot.sendMessage(
            properties['debugChatId'],
            chatdetail +
            " post callbackquery: command=" +
            command +
            " value=" +
            data
        );
        //return;
        if (command == "recent") {
            var id = dataquery[1];
            var text = Recent(id);
            if (text != query.message.text) {
                bot.sendMessage(chatid, text, {
                    parse_mode: "Markdown",
                });
                bot.sendMessage(properties['debugChatId'], "answerCallbackQuery with callbackid " + callbackid + " and text 好啦");
            } else {
                bot.sendMessage(properties['debugChatId'], "answerCallbackQuery with callbackid " + callbackid + " and text 没有新数据哦");
            }
        }
    });
}