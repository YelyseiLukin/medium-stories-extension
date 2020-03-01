'use strict';

const MODES = {
  ALL: 'all',
  STORIES: 'stories',
  COMMENTS: 'comments',
};

const items = [
  {
    value: MODES.COMMENTS,
    title: 'Comments',
  },
  {
    value: MODES.STORIES,
    title: 'Stories',
  },
  {
    value: MODES.ALL,
    title: 'All',
  },
];

const menuElements = [];
let storyElements = [];

const mode = Mode();

createMenu();
setActiveMenuItem();
setStoriesInitialStyle();
setStoriesVisibility();

function createMenu() {
  const menu = document.querySelector('.ex.bw.be.ey.ez');

  items.forEach(({value, title}) => {
    let element = document.createElement('li');

    element.classList.add('ms_menu-item');
    element.innerText = title;
    element.onclick = () => mode.set(value);

    menu.appendChild(element);

    menuElements.push(element);
  });
}

function setActiveMenuItem() {
  items.forEach(({value, title}, index) => {
    if (value === mode.get()) {
      menuElements[index].classList.add('ms_menu-item--active');
    } else {
      menuElements[index].classList.remove('ms_menu-item--active');
    }
  });
}

function Mode() {
  let mode = MODES.ALL;

  chrome.storage.sync.get(['mode'], (result) => {
    if (result.mode) {
      set(result.mode);
    }
  });

  const get = () => mode;

  const set = (newMode) => {
    if (mode !== newMode) {
      mode = newMode;
      setActiveMenuItem();
      setStoriesInitialStyle(); // TODO remove
      setStoriesVisibility();
      chrome.storage.sync.set({mode: newMode});
    }
  };

  return {
    get,
    set,
  };
}

function setStoriesInitialStyle() {
  const stories = document.querySelector('.da.db.dc.ai.dd.r.de.df.dg.dh.di.dj.dk.dl.dm.dn.do.dp.dq').children[2].querySelectorAll('.dr.fg.ew.r');

  storyElements = [...stories];

  storyElements.forEach((story) => {
    story.classList.add('story');
  });
}

function setStoriesVisibility() {
  storyElements.forEach((story) => {
    let visible;

    if (mode.get() === MODES.ALL) {
      visible = true;
    } else {
      let isStory = false;

      const texts = story.children[1].querySelector('.aq.b.ar.as.at.au.r.av.aw');
      console.log('texts', texts.length, texts);
      // const star = story.children[1].querySelector('.aq.b.ar.as.at.au.r.av.aw');
      // if (star) isStory = true;
      //
      // console.log('star', star);
      // if (!isStory) {
      //   const publication = story.children[1].querySelector('.fr.n.dt').querySelectorAll('.aq.b.ar.as.at.au.r.av.aw');
      //   console.log('texts', publication.length, publication);
      //   if (publication.length === 5) isStory = true;
      // }

      if (mode.get() === MODES.STORIES) visible = isStory;
      if (mode.get() === MODES.COMMENTS) visible = !isStory;
    }

    if (visible) {
      story.classList.remove('story--hidden');
    } else {
      story.classList.add('story--hidden');
    }
  });
}
