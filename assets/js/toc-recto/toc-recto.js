
/**
 * TocRecto类。借助js构造函数定义，未使用ES6类语法
 * 构造函数类属性值有:
 * article: 文章区域的id。默认'article'
 * headings: 要解析的标题级别。默认'h2,h3,h4,h5,h6'
 * @param {*} config 配置信息，赋值方式config = {}
 */
function TocRecto(config){

    //默认属性与验证规则
    var defaultProperties = {
        article: {
            defaultValue: 'article',
            // validate: function(value){
            //     if (typeof value !== 'string') {
            //         throw new Error('article must be a string');
            //     }
            // }
        },
        headings: {
            defaultValue: 'h2,h3,h4,h5,h6'
        },
        position: {
            defaultValue: 'fixed'
        },
        tocHeader: {
            defaultValue: '本文目录'
        },
        //是否优化标题id，默认为true。
        headingOptimal: {
            defaultValue: true
        },
        home:{
            defaultValue: '#'
        }
    };

    // 动态定义 getter 和 setter
    for (let prop in defaultProperties) {
        if (defaultProperties.hasOwnProperty(prop)) {
            let descriptor = defaultProperties[prop];
            Object.defineProperty(this, prop, {
                get: function() {
                    return this[`_${prop}`];
                },
                set: function(value) {
                    // descriptor.validate(value);
                    this[`_${prop}`] = value;
                }
            });
            
            // 初始化私有属性
            this[`_${prop}`] = descriptor.defaultValue;
        }
    }

    // 用传参中的配置信息给属性赋值
    if (config) {
        for (const prop in config) {
            if (config.hasOwnProperty(prop)) {
                try {
                    this[prop] = config[prop];
                } catch (error) {
                    console.error(error);
                }
                
            }
        }
    }
    
}

const _tocSidebar = 'su-toc-sidebar';
const _tocOverlay = 'su-toc-overlay';
const _tocHeader = 'su-toc-header';
const _tocContent = 'su-toc-conent';
const _tocMenu = 'su-toc-menu';

// 原型方法createTOCElement()，生成导读栏所需要的html元素
TocRecto.prototype.createTOCElement = function() {

    //创建导读菜单栏
    const tocMenu = document.createElement('div');
    tocMenu.className = _tocMenu;
    tocMenu.id = _tocMenu;
    // tocMenu.innerHTML = `
    //     <button class="su-toc-button" onclick="sucScrollToTop()">
    //         <span>回</span>
    //         <span>到</span>
    //         <span>顶</span>
    //         <span>部</span>
    //     </button>
    //     <button class="su-toc-button" onclick="sucToggleSidebar()">
    //         <span>导</span>
    //         <span>读</span>
    //         <span>目</span>
    //         <span>录</span>
    //     </button>
    // `;
    tocMenu.innerHTML = `
        <button class="su-toc-button" onclick="sucScrollToTop()">
            <span class="fa--chevron-up"></span>
        </button>
        <button class="su-toc-button" onclick="sucToggleSidebar()">
            <!-- <span class="fa--list-ul"></span> -->
            <span>导</span>
            <span>读</span>
            <span>目</span>
            <span>录</span>
        </button>
        <button class="su-toc-button" onclick="sucGo2Href('${this.home}')">
            <span class="fa--house-chimney"></span>
        </button>
        <button class="su-toc-button" onclick="sucScrollToButtom()">
            <span class="fa--chevron-down"></span>
        </button>
    `;

    // 创建遮罩层
    const tocOverlay = document.createElement('div');
    tocOverlay.id = _tocOverlay;
    tocOverlay.className = _tocOverlay;
    
    //创建导读栏容器
    const tocSidebar = document.createElement('div');
    tocSidebar.id = _tocSidebar;
    tocSidebar.className = _tocSidebar;
    //创建导读栏头部
    const tocHeader = document.createElement('div');
    tocHeader.className = _tocHeader;
    tocHeader.innerHTML = `
            <h3>${this.tocHeader}</h3>
            <button onclick="sucToggleSidebar()">x</button>
    `;
    tocSidebar.appendChild(tocHeader);
    //创建导读栏内容区
    const tocContent = document.createElement('div');
    tocContent.className = _tocContent;
    tocSidebar.appendChild(tocContent);
    
    // 返回创建好的元素
    return {tocMenu, tocSidebar, tocOverlay};
};

// 原型方法generateTOC()：生成导航目录
TocRecto.prototype.generateTOC = function() {
    try {
        // 创建导读栏元素并插入到页面中
        const {tocMenu, tocSidebar, tocOverlay} = this.createTOCElement();
        document.body.appendChild(tocMenu);
        document.body.appendChild(tocOverlay);
        document.body.appendChild(tocSidebar);
        
        // 获取文章区域
        const article = document.getElementById(this.article);
        if (!article) {
            throw new Error(`未找到 id="${this.article}" 的文章区域，无法进行后续toc生成`);
        }
        // 获取toc区域
        // const tocContent = document.querySelector('.su-toc-conent');
        const tocContent = tocSidebar.querySelector(`.${_tocContent}`);
        // 基础字体大小（单位：px）
        let baseFontSize = 16;
        // 基础左边距（单位：px）
        let baseMarginLeft = 10;
        
        if (tocContent) {
            //清空现有内容
            tocContent.innerHTML = '';

            const contentFontSize = window.getComputedStyle(tocContent).getPropertyValue('font-size');
            if (contentFontSize) {
                baseFontSize = contentFontSize.replace('px', '');
            }
        }
        
        const headings = article.querySelectorAll(this.headings);
        if (headings) { 
            // 顶层标题级别
            const rootLevel = parseInt(headings[0].tagName.slice(1));
            //根级标题数量
            var rootCount = 0;
            // 标题栈，后进先出，最终只存放根级目录个数的标题。
            var toc = [];
            // 遍历标题，整理出toc目录结构对象
            headings.forEach(heading => {
                // 标题级别
                const level = parseInt(heading.tagName.slice(1));
                // 为标题添加id，以便链接跳转
                if (!heading.id || this.headingOptimal === true ) {
                    const headingText = heading.id ? heading.id : heading.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                    heading.id = `heading-${headingText}`;
                }

                var item = {
                    id: heading.id,
                    level: level,
                    title: heading.textContent,
                    children:[]
                }
                // 当前层级元素超过上下级逐一增加的个数时，将多出的元素推出去，这样既可保证父元素始终位于最后的位置。
                // 例如若当前是h4标题时，toc栈大概是:[h2,h2,h3,h3,h4,h4]，此时多出的2个h4会全部推出栈顶，这样就能保证当前循环的h4标题位于离它最近的h3的下级。
                while (toc.length - rootCount > 0 && (toc.length - (rootCount - 1) > level - rootLevel)) {
                    toc.pop();
                }

                if (level == rootLevel) {
                    rootCount++;
                }
                else{
                    // 下级目录，在父节点追加
                    parent = toc[toc.length - 1];
                    parent.children.push(item);
                }
                toc.push(item);   
                
            });
            //循环结束后，栈内还有非顶层级别的元素时，全部推出。
            while (toc.length - rootCount > 0) {
                toc.pop();
            }
            // console.log(toc);

            if (toc.length > 0) {
                const ul = document.createElement('ul');
                tocContent.appendChild(ul);
                //遍历目录，开始构建toc的html元素
                //若要展开第一层目录，fold=false
                createTocElement(toc, ul, true);
            }

        }
        
        
    } catch (error) {
        console.error(error);
    }
}

/**
 * 构建生成TOC目录的html元素
 * 
 * @param {Array} toc toc数组对象
 * @param {object} ul ul元素
 * @param {boolean} fold 是否折叠。默认false
 * @param {number} rootLevel 顶层目录级别。默认rootLevel=2
 */
function createTocElement(toc, ul, fold=false, rootLevel=2){
    // 基础字体大小（单位：px）
    let baseFontSize = 16;
    // 基础左边距（单位：px）
    let baseMarginLeft = 10;

    if (toc.length > 0) {
        parentlevel = toc[0].level - 1;
        //遍历目录，开始构建html
        toc.forEach(item => {
            // 锚点
            const a = document.createElement('a');
            a.href = '#' + item.id;
            a.textContent = item.title;
            const li = document.createElement('li');
            li.className = 'su-toc-item';
            li.appendChild(a);
            if (item.level === rootLevel) {
                li.style.borderBottom = '1px solid #ddd';
            }
            else{
                // 下级目录做一下递进
                li.style.fontSize = baseFontSize * (1 - (item.level - rootLevel) * 0.06) + 'px';
                li.style.marginLeft = baseMarginLeft + (item.level - rootLevel) * 6 + 'px';
            }
            if (item.children.length > 0) {
                const subUl = document.createElement('ul');
                // 是否折叠子节点
                if (fold) {
                    const details = document.createElement('details');
                    const summary = document.createElement('summary');
                    details.appendChild(summary);
                    const i = document.createElement('i');
                    i.className = 'fa--angle-down';
                    //增加一点左右内边距，以免在屏幕尺寸太小时不好点击
                    i.style.padding = "0 1.2em";
                    summary.appendChild(a);
                    summary.appendChild(i);
                    
                    li.appendChild(details);
                    details.appendChild(subUl);
                }
                else{
                    li.appendChild(subUl);
                }
                
                createTocElement(item.children, subUl, true);
            }
            ul.appendChild(li);
        });
    }
}

function sucToggleSidebar() {
    const sidebar = document.getElementById(_tocSidebar);
    const overlay = document.getElementById(_tocOverlay);
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function sucHideSidebar() {
    const sidebar = document.getElementById(_tocSidebar);
    const overlay = document.getElementById(_tocOverlay);
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
}
function sucScrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function sucScrollToButtom(){
    // document.documentElement.scrollHeight滚动到文档的总高度
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
}

function sucGo2Href(href){
    href = href ? href : '#';
    window.location.href = href;
}

// 监听toc区域，当点击空白处或a标签时，隐藏toc栏
document.addEventListener('DOMContentLoaded', () => {
    const tocSidebar = document.querySelector(`.${_tocSidebar}`);
    const tocOverlay = document.querySelector(`.${_tocOverlay}`);

    // 监听导读栏点击事件。点击a标签时后，收起侧边栏
    tocSidebar.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a') {
            sucToggleSidebar();
        }
    });
    
    //监听遮罩层点击事件。如果点击了遮罩层的其他区域，收侧边栏
    tocOverlay.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a' || !tocSidebar.contains(event.target)) {
            sucToggleSidebar();
        }
    });
    
});

