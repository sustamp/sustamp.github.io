
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
