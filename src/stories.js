const mode = Mode();
const locator = Location();
const menu = Menu();
const stories = Stories();

setInterval(() => {
  locator.update({
    onEnter: () => {},
    onLeave: () => {
      menu.clear();
      stories.clear();
    },
  });

  if (!locator.isStoriesPage()) return;

  if (menu.isEmpty()) {
    menu.create();
    menu.setActiveItem();
  }

  stories.update();
}, 250);

function Location() {
  const STORIES_LOCATION = 'https://medium.com/me/stories/public';

  let previous = '';
  let current = '';

  const update = ({onEnter, onLeave}) => {
    previous = current;
    current = window.location.href;

    if (previous !== STORIES_LOCATION && current === STORIES_LOCATION) onEnter();
    if (previous === STORIES_LOCATION && current !== STORIES_LOCATION) onLeave();
  };

  const isStoriesPage = () => current === STORIES_LOCATION;

  return {
    update,
    isStoriesPage,
  };
}

function Mode() {
  const MODES = {
    ALL: 'all',
    STORIES: 'stories',
    COMMENTS: 'comments',
  };

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
      menu.setActiveItem();
      stories.setVisibility();
      chrome.storage.sync.set({mode: newMode});
    }
  };

  return {
    get,
    set,
    MODES,
  };
}

function Menu() {
  const items = [
    {
      value: mode.MODES.COMMENTS,
      title: 'Comments',
      count: (storiesCount, commentsCount) => commentsCount,
    },
    {
      value: mode.MODES.STORIES,
      title: 'Stories',
      count: (storiesCount, commentsCount) => storiesCount,
    },
    {
      value: mode.MODES.ALL,
      title: 'All',
      count: (storiesCount, commentsCount) => storiesCount + commentsCount,
    },
  ];

  let elements = [];
  let created = false;
  let storiesCount = 0;
  let commentsCount = 0;

  const create = () => {
    created = true;
    const menu = document.querySelector('section').children[1].children[0].children[0];

    items.forEach(({value, title, count}, index) => {
      let element = document.createElement('li');

      if (index === 0) element.style.marginRight = '0';
      element.classList.add('ms_menu-item');
      element.innerText = `${title} ${count(storiesCount, commentsCount)}`;
      element.onclick = () => mode.set(value);

      menu.appendChild(element);

      elements.push(element);
    });
  };

  const setActiveItem = () => {
    items.forEach(({value, title}, index) => {
      if (value === mode.get()) {
        elements[index].classList.add('ms_menu-item--active');
      } else {
        elements[index].classList.remove('ms_menu-item--active');
      }
    });
  };

  const updateTexts = (sCount, cCount) => {
    storiesCount = sCount;
    commentsCount = cCount;

    elements.forEach((menuElement, index) => {
      menuElement.innerText = `${items[index].title} ${items[index].count(storiesCount, commentsCount)}`;
    });
  };

  const clear = () => {
    const menu = document.querySelector('section').children[1].children[0].children[0];

    if (menu) {
      elements.forEach((element) => {
        menu.removeChild(element);
      });
    }

    elements = [];
    created = false;
    storiesCount = 0;
    commentsCount = 0;
  };

  const isEmpty = () => !created;

  return {
    create,
    clear,
    setActiveItem,
    updateTexts,
    isEmpty,
  }
}

function Stories() {
  let elements = [];

  const update = () => {
    const stories = [...document.querySelector('section').children[2].children].filter((item) => item.classList.length);

    if (stories.length !== elements.length) {
      elements = [...stories];

      setInitialStyle();
      setVisibility();
    }
  };

  const clear = () => {
    elements = [];
  };

  const setInitialStyle = () => {
    elements.forEach((story) => {
      story.classList.add('story');
    });
  };

  const setVisibility = () => {
    let storiesCount = 0;
    let commentsCount = 0;

    elements.forEach((story) => {
      let visible;

      const texts = story.children[1].querySelectorAll('div');

      let isStory = texts.length > 9;

      if (isStory) {
        storiesCount++;
      } else {
        commentsCount++;
      }

      if (mode.get() === mode.MODES.ALL) visible = true;
      if (mode.get() === mode.MODES.STORIES) visible = isStory;
      if (mode.get() === mode.MODES.COMMENTS) visible = !isStory;

      if (visible) {
        story.classList.remove('story--hidden');
      } else {
        story.classList.add('story--hidden');
      }
    });

    menu.updateTexts(storiesCount, commentsCount);
  };

  return {
    clear,
    update,
    setInitialStyle,
    setVisibility,
  }
}
