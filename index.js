import request from 'request';
import cheerio from 'cheerio';
import rp from 'request-promise';

class DailyList {
    constructor() {
        this.Data = [];
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
                    elems[5] = [];
                    $('a').each(function(n, elemx) {
                        let xml_href = '';
                        xml_href = $(this).attr('href').replace('list', 'rss/rss.xml');
                        elems[5].push(xml_href);
                        //elems[6].push(that.get_xml(xml_href));
                    });
                    if (elems[3].length == 0) {
                        elems[5] = [];
                        elems[5] = 'https://share.dmhy.org/topics/list?keyword=' + elems[2];
                    }
                    //console.log(elems[1], elems[3].length == 0);
                })
            })
            that.Data = List;
            console.log(JSON.stringify(List));
            //that.regulate();
        });

    }
    regulate() {
        var day = 0,
            item = 0,
            link = 0,
            over = false,
            that = this;

        let time = setInterval(function() {
                //console.log(day + " " + item);
                let day_max = that.Data[day].length;
                let day_item = that.Data[day][item].length;
                let day_link = that.Data[day][item][5].length;
                console.log(day, item, link, that.Data[day][item][5].length);
                if (link < day_link) {
                    link++;
                } else {
                    if (item < day_item) {
                        item++;
                    } else {

                        if (day < day_max) {
                            day++;
                        } else {
                            clearInterval(time);
                        }
                        item = 0;
                    }
                    link = 0;
                }
                //clearInterval(time);
            },
            100);
    }
    get_xml(xml_url) {
        //let xml = new Array(4).fill([]); WTF
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
        rp(xml_url)
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
                    //console.log(JSON.stringify(xml));
                return xml;
            })
            .catch(function(err) {
                console.log(err);
                // Crawling failed...
            });
        /*
           request(url, function(error, response, body) {
               let html = new DailyList().xml_html(body);
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
               return xml;
               //console.log(JSON.stringify(xml));
           });*/
        return 'GG';
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
//new DailyList().get_xml('https://share.dmhy.org/topics/rss/rss.xml?keyword=%E7%A2%A7%E8%97%8D%E5%B9%BB%E6%83%B3%20%E6%BE%84%E7%A9%BA%20%E9%9B%AA%E9%A3%84');