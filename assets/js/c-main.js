
/** @type {*} localStorage 缓存时间，单位为毫秒 */
const TTL_LOCALSTORAGE = 60 * 60 * 1000;
/**
 * 使用fetch api读取url，并插入到指定元素中。
 *
 * @param {*} url 页面url地址，请注意只能是http或https开头的地址。files://开头的url无法使用fetch，需要使用其他方式。
 * @param {*} targetid 父页面的容器元素id，用于存放页面url的html内容
 */
function loadContent(url, targetid) {

    if (window.location.origin.startsWith('file://')) {
        alert('当前页面由本地文件系统打开，无法通过fetch Api加载子页面！\n' +
            '提示：可使用本地服务器或VS Code的Live Server插件打开网页。')
        return;   
    }

    if (url === null){
        url = '404.html';
    }

    let target = targetid || 'content-wrapper';

    console.info('fetch ' + url + ' to ' + target);

    fetch(url, {
        method: 'GET',
        mode: 'no-cors',        
    })
    .then(response => response.text())
    .then(data => {
        // 插入子页面的 HTML 内容
        document.getElementById(target).innerHTML = data;
        
        // 获取子页面的脚本标签
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const scripts = doc.querySelectorAll('script');
        // 动态插入并执行子页面的脚本
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            document.head.appendChild(newScript);
        });
    })
    .catch(error => console.error('加载子页面时发生错误:', error));
}

function hashToDataPage(hash){
    if (!hash){
        hash = '#/';
    }
    const link = document.querySelector(`a[href="${hash}"]`);
    if (link) {
        let path = link.getAttribute('data-page');
        return path || '404.html';
    }
    else{
        return '404.html';
    }
}

/**
 * 读取文件内容，只能通过<input type="file">方式选择的文件可以使用本函数。
 *
 * @param {*} file
 * @return {*} 
 */
function readFile(file) {
    console.info('read...')
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
            reader.readAsText(file);
    });
}

/**
 * 转换为Data Url
 *
 * @param {*} fileContent
 * @param {*} mimeType 文件类型，如text/html
 * @return {*} 
 */
function convertToDataUrl(fileContent, mimeType){
    const blob = new Blob([fileContent], { type: mimeType });
    return URL.createObjectURL(blob);
}

/**
 * 动态加载CSS样式
 *
 * @param {String} href css文件的url
 */
function loadCSS(href){
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
}

/**
 * 生成并插入a标签
 *
 * @param {*} config 配置信息
 * @param {*} selector 选择器，css-class传参'.className'。dom元素id传参'#idName'。
 */
function generateLinks(config, selector){
    // 获取导航栏的DOM元素
    const navList = document.querySelector(selector);

    config.routers.forEach(router => {
        // 创建a标签a
        const a = document.createElement('a');
        a.href = (router.outer !== null && router.outer === true) ? router.href : '#' + router.href;
        a.textContent = router.title;
        a.setAttribute('data-page', router.url);
        // 创建li标签
        const li = document.createElement('li');
        li.appendChild(a);
        // 将li标签添加到导航栏
        navList.appendChild(li);
    });
}

function setInLocalStorage(key, value){
    //设置过期时间再存储
    const item = {
        value: value,
        ttl: TTL_LOCALSTORAGE + new Date().getTime()
    }
    
    localStorage.setItem(key, JSON.stringify(item));
}

 function getFromLocalStorage(key){
    const valJson = JSON.parse(localStorage.getItem(key));
    if (valJson == null) {
        return null;
    }
    let value = valJson.value;
    let ttl = valJson.ttl ? valJson.ttl : 0;
    const nowTimestamp = new Date().getTime();
    if ( !ttl || nowTimestamp > ttl) {
        // 如果过期，则删除该值
        localStorage.removeItem(key);
        value = null;
    }
    return value;
}

/**
 * 在指定的选择器上生成 a 标签。
 *
 * @param {*} selector 选择器，css-class传参'.className'。dom元素id传参'#idName'。
 */
async function createLinks(selector){
    try {
        // 检查LocalStorage中是否有数据
        // let config = JSON.parse(localStorage.getItem('my-config'));
        let config = getFromLocalStorage('my-config');
        if (config !== null) {
            generateLinks(config, selector);
            return;
        }

        // 若没有数据，读取配置文件
        await fetch('myconfig.json')
        .then(response => response.json()) // 解析JSON响应
        .then(data => {
            // 将数据存储在LocalStorage中
            // localStorage.setItem('my-config', JSON.stringify(data));
            setInLocalStorage('my-config', data);

            // 生成并插入a标签
            config = data;
            generateLinks(config, selector);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } catch (error) {
        console.error('读取配置文件时出错:', error);
    }
}


/** 
 * 在DOM元素全部加载后执行
 *  或在document.addEventListener('DOMContentLoaded', function(){})中执行 
 * */

// 监听导航栏a标签的点击事件，利用时间动态加载子页面
document.querySelectorAll('.nav-links-column a, .nav-links a').forEach(link => {
    link.addEventListener('click', function(event) {
        const url = this.getAttribute('data-page'); // 获取a标签的data-page属性值
        console.info('to load ' + url);
        if (url !== null) {
            // event.preventDefault(); // 阻止默认的a标签跳转行为
        }
        
        loadContent(url, 'content-wrapper'); // 动态加载子页面
    });
});


// loadContent('pages/home.html', 'content-wrapper'); //这会导致每次刷新页面都加载主页。
// 哈希监听方式来监听页面变化，避免每次刷新页面都加载主页。
window.addEventListener('hashchange', function() {
    const hash = window.location.hash;
    console.info('hash change to ' + hash);
    loadContent(hashToDataPage(hash));
})


