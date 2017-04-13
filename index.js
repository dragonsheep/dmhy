import request from 'request';
import cheerio from 'cheerio';
import rp from 'request-promise';
import fs from 'fs';
class DailyList {
    constructor() {
        this.Data = [];
        this.err = [];
    }
    get_list() {
        var that = this;
        request('http://uwps.magn.space/prog_script.js', function(error, response, body) {
            let sunword, monword, tueword, wedword, thuword, friword, satword;
            let sunarray, monarray, tuearray, wedarray, thuarray, friarray, satarray, longarray, sfxarray;
            eval(body);
            let List = [sunarray, monarray, tuearray, wedarray, thuarray, friarray, satarray, longarray, sfxarray];
            List.map(function(elem, i) {
                elem.map(function(elems, j) {
                    if (elems[2].length == 0) {
                        elem.splice(j, 1);
                    }
                })
                elem.map(function(elems, j) {
                    const $ = cheerio.load(elems[3]);
                    elems.push([], [], []);
                    $('a').each(function(n, elemx) {
                        let xml_href = '';
                        xml_href = $(this).attr('href').replace('list', 'rss/rss.xml');
                        if (i == 5 && j == 4 && n == 1) {
                            xml_href = "https://share.dmhy.org/topics/rss/rss.xml?keyword=雛子的筆記 愛戀 丸子家族"
                        }
                        elems[5].push(xml_href);
                        elems[6].push($(this).html());
                    });
                    if (elems[3].length == 0) {
                        elems[5] = [];
                        elems[6] = [];
                        elems[5][0] = 'https://share.dmhy.org/topics/rss/rss.xml?eyword=' + elems[2];
                        elems[6][0] = '字幕組';
                    }
                })
            })
            that.Data = List;
            that.regulate();
        });
    }
    regulate() {
        var that = this,
            delay = 500,
            time = 0,
            total = 0,
            progress = 0;
        this.Data.map((elem, i) => {
            elem.map((elems, j) => {
                elems[5].map((elemx, n) => {
                    total++;
                    setTimeout(() => {
                        progress++;
                        that.get_xml(elemx, elems);
                        that.anim(progress, total, time);
                    }, time);
                    time += delay;
                })
            })
        });
        setTimeout(() => {
            fs.writeFileSync("./log/result.json", JSON.stringify(this.Data));
            fs.writeFileSync("./log/error.json", JSON.stringify(that.err));
        }, time + delay);
    }
    anim(progress, total, time) {
        //console.log(num);
        let num = Math.ceil((progress / total) * 50);
        let double = Math.ceil((progress / total) * 10000) / 100;
        time = time * 0.001;
        let max = 50;
        let mount = max - num;
        let view = "["
        for (let i = num; i > 0; i--) {
            view += "=";
        }
        for (let i = mount; i > 0; i--) {
            view += "_";
        }
        view += "]";
        console.log(view + " " + progress + " / " + total + " " + double + "%  ");
    }
    get_xml(xml_url, elem) {
        var that = this;
        let xml = [
            [],
            [],
            [],
            []
        ];
        let charset = [
            "&#x7E41;&#x9AD4;|&#x7E41;&#x4F53;|&#x7E41;|[Bb][Ii][Gg]5",
            "&#x7B80;&#x9AD4;|&#x7B80;&#x4F53;|&#x7B80;|[Gg][Bb]"
        ];
        rp(encodeURI(xml_url))
            .then(function(htmlString) {
                let html = new DailyList().xml_html(htmlString);
                const $ = cheerio.load(html);
                $('item').map(function(j, elems) {
                    let title = $(this).find('title').length ? $(this).find('title').html() : null;
                    let cover = $(this).find('img').length ? $(this).find('img')[0].attribs.src : null;
                    let magnet = $(this).find('enclosure').length ? $(this).find('enclosure')[0].attribs.url : null;
                    let json = {};
                    json.title = title;
                    json.cover = cover;
                    json.magnet = magnet;
                    if (title.match(charset[0]) !== null) {
                        xml[0].push(json);
                    }
                    if (title.match(charset[1]) !== null) {
                        xml[1].push(json);
                    }
                    if (title.match(charset[1]) !== null && title.match(charset[0]) !== null) {
                        xml[2].push(json);
                    }
                    if (title.match(charset[1]) === null && title.match(charset[0]) === null) {
                        xml[3].push(json);
                    }
                })
                elem[7].push(xml);
                return xml;
            })
            .catch(function(err) {
                console.log('==================err==================');
                that.err.push(err);
            });
    }
    xml_html(body) {
        let html = body;
        for (let i = 0; i < body.split("CDATA").length; i++) {
            html = html.replace('<![CDATA[', '');
            html = html.replace(']]>', '');
        }
        return html;
    }
}
new DailyList().get_list();