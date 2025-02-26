
/**
 * 当汉堡按钮被点击时显示或隐藏导航菜单。
 * 
 * @param {String} burgerSelector 汉堡按钮的选择器
 * @param {string} menuSelector 导航菜单的选择器
 * @param {string} cssClass 用于显示或隐藏导航菜单的CSS类名
 */
// export 
function burgerClick(burgerSelector, menuSelector, showName, hiddenName) {
    const burger = document.getElementById(burgerSelector);
    const navMenu = document.getElementById(menuSelector);

    // 点击菜单键时显示菜单栏
    burger.addEventListener('click', () => {
        if (navMenu.classList.contains(hiddenName)) {
            navMenu.classList.remove(hiddenName);
            navMenu.classList.add(showName);
        } else {
            navMenu.classList.remove(showName);
            navMenu.classList.add(hiddenName);
        }
        // navMenu.classList.toggle(hiddenName);
    });
    
    // 在此菜单键或空白处时回收菜单栏
    document.addEventListener('click', function (event) {
        // if (!navMenu.contains(event.target) && event.target !== navToggle) {
        //     navMenu.classList.remove('show');
        //     alert("not target")
        // }
        if (navMenu.contains(event.target) || !burger.contains(event.target)) {
            navMenu.classList.remove(showName);
            navMenu.classList.add(hiddenName);
        }
    });
}

/**
 * 搜索。根据inputid对应的搜索框的值，检索所有样式为"card-listing"的section标签。
 *
 * @param {String} inputid 搜索框的id。
 */
function search(inputid){
    //获取搜索框的值
    const query = document.getElementById(inputid).value.toLowerCase();
    console.info('query:' + query);

    // 检索范围：所有样式为"card-listing"里的section标签
    // 注：搜索到标签中有标题符合搜索条件则显示，否则隐藏。
    // 但这里有个问题，搜索结果是按照卡片顺序排序，会造成某些卡片即便不符合搜索条件也会排列在上方。
    // 现有的做法中无论是查找parentElement还是设置order都会引起一些问题，故暂不处理
    const sections = document.querySelectorAll('.card-listing section');
    let order = 1;
    
    sections.forEach(section => {
         const content = section.innerText;
         if (content.toLowerCase().includes(query)) {
            //  console.info('content:' + content);
             section.classList.remove('hidden');
         }
         else{
            section.classList.add('hidden');
         }
    });
    
}

// 设定一些基础样式
const cradBox_css = "card-box";
const img_css = "card-img";
const boxHeader_css = "box-header";
const cardListing_css = "card-listing";
const cardBody_css = "card-body";
const cardInfo_css = "card-info";
const contentTile_css = "content-title";
const descr_css = "content-text overflow-clip";


async function autoContentGenerate(){
        
    try {
        
        await fetch('localdata/resourcelinks.json')
        .then(response => response.json()) // 解析JSON响应
        .then(data => {
            // setInLocalStorage('navigation-json', data);
            if (data.main !== null) {
                const main = document.getElementById('main');
                if (main == null) {
                    throw new Error('未找到id="main"的目标元素');
                }
                data.main.forEach(item => {
                    const box = createCardBox(item);
                    main.appendChild(box);
                });
            }
            
        })
    } catch (error) {
        console.error('自动生成内容页时出错:', error);
    }
    
}

function createCardBox(item){
    // const data = JSON.parse(item);
    
    let target = document.getElementById(item.id);
    //如果目标存在，则追加节点。否则创建目标
    if (target == null) {
        // 创建容器
        const cardBox = document.createElement('section');
        cardBox.setAttribute('id', item.id);
        cardBox.setAttribute('class', item?.css || cradBox_css);
        // 添加子元素
        const boxHeader = document.createElement('div');
        boxHeader.setAttribute('class', boxHeader_css);
        if (item.img !== null) {
            const picture = document.createElement('picture');
            picture.setAttribute('class', img_css);
            const img = document.createElement('img');
            img.setAttribute('src', item.img);
            picture.appendChild(img);
            boxHeader.appendChild(picture);
        }
        const category = document.createElement('div');
        category.innerHTML = '<span>' + item.category + '</span>';
        boxHeader.appendChild(category);

        // 将相关元素添加到容器中
        cardBox.appendChild(boxHeader);
        target = cardBox;
    }
    createCardListring(target, item.content);

    return target;
    
}

function createCardListring(cardbox, content){

    // 查找是否已有内容标签，没有则创建
    let cardListing = cardbox.querySelector(`.${content?.css || cardListing_css}`);
    if (!cardListing) {
        cardListing = document.createElement('div');
        cardListing.setAttribute('class', content?.css || cardListing_css);
        cardbox.appendChild(cardListing);
    }
    // 遍历清单
    content.list.forEach(e => {
        // 创建卡片
        const card = document.createElement('section');
        card.setAttribute('class', e?.css || cardBody_css);
        // 设置a标签
        const a = document.createElement('a');
        a.setAttribute('href', e.href);
        a.setAttribute('target', "_blank");
        a.setAttribute('title', e.description);
        // 设置图片信息
        if (e.picture !== undefined) {
            const picture = document.createElement('picture');
            picture.setAttribute('class', e.picture?.css || img_css);
            const img = document.createElement('img');
            img.setAttribute('src', e.picture.src);
            picture.appendChild(img);
            a.appendChild(picture);
        }
        const info = document.createElement('div');
        info.setAttribute('class', cardInfo_css);
        const div = document.createElement('div');
        div.innerHTML = '<span>' + e.name + '</span>';
        div.setAttribute('class', contentTile_css);
        const span = document.createElement('span');
        span.setAttribute('class', descr_css);
        span.innerHTML = e.description;
        //info不为空，则依据info中的内容重设样式
        if (e.info !== null) {
            info.setAttribute('class', e.info?.css || cardInfo_css);
            div.setAttribute('class', e.info?.titleStyle || contentTile_css);
            span.setAttribute('class', e.info?.descStyle || descr_css);
            
        }
        info.appendChild(div);
        info.appendChild(span);
        
        a.appendChild(info);

        card.appendChild(a);
        cardListing.appendChild(card);
    });
    

    
    
    // if (item.content !== null) {
    //     const cardListing = document.createElement('div');
    //     cardListing.setAttribute('class', item.content?.css || cardListing_css);
        
        
    //     cardBox.appendChild(cardListing);
    // }
    // main.appendChild(cardBox);

}


