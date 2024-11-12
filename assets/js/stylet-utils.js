
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
    const sections = document.querySelectorAll('.card-listing section');
    
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


async function autoContentGenerate(){
    try {
        
        await fetch('localdata/resourcelinks.json')
        .then(response => response.json()) // 解析JSON响应
        .then(data => {
            // setInLocalStorage('navigation-json', data);
            if (data.main !== null) {
                const main = document.getElementById('main');
                data.main.forEach(item => {
                    const target = document.getElementById(item.id);
                    //如果目标存在，则追加节点。否则创建目标
                    if (target !== null) {
                        console.info('找到目标：' + item.id);
                    }
                    else{
                        // 创建容器
                        const cardBox = document.createElement('section');
                        cardBox.setAttribute('id', item.id);
                        cardBox.setAttribute('class', item.css);
                        // 添加子元素
                        const boxHeader = document.createElement('div');
                        boxHeader.setAttribute('class', 'box-header');
                        if (item.img !== null) {
                            const picture = document.createElement('picture');
                            picture.setAttribute('class', 'card-img');
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
                        
                        if (item.content !== null) {
                            const cardListing = document.createElement('div');
                            cardListing.setAttribute('class', item.content.css);
                            // 遍历清单
                            item.content.list.forEach(e => {
                                // 创建卡片
                                const card = document.createElement('section');
                                card.setAttribute('class', e.css);
                                // 设置a标签
                                const a = document.createElement('a');
                                a.setAttribute('href', e.href);
                                a.setAttribute('target', "_blank");
                                a.setAttribute('title', e.description);
                                // 设置图片信息
                                if (e.picture !== null) {
                                    const picture = document.createElement('picture');
                                    picture.setAttribute('class', e.picture.css);
                                    const img = document.createElement('img');
                                    img.setAttribute('src', e.picture.src);
                                    picture.appendChild(img);
                                    a.appendChild(picture);
                                }
                                //设置介绍信息
                                if (e.info !== null) {
                                    const info = document.createElement('div');
                                    info.setAttribute('class', e.info.css);
                                    const div = document.createElement('div');
                                    div.setAttribute('class', e.info.titleStyle);
                                    div.innerHTML = '<span>' + e.name + '</span>';
                                    const span = document.createElement('span');
                                    span.setAttribute('class', e.info.descStyle);
                                    span.innerHTML = e.description;
                                    
                                    info.appendChild(div);
                                    info.appendChild(span);
                                    
                                    a.appendChild(info);
                                }
                                card.appendChild(a);
                                cardListing.appendChild(card);
                            });
                            cardBox.appendChild(cardListing);
                        }
                        main.appendChild(cardBox);
                    }
                    
                });
            }
            
        })
    } catch (error) {
        console.error('自动生成内容页时出错:', error);
    }
    
    
}


