const nav = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', function() {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  backToTop.classList.toggle('show', window.scrollY > 500);
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  document.getElementById('progressBar').style.width = progress + '%';
});

backToTop.addEventListener('click', function() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', function() {
  navToggle.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});
navLinksEl.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    navToggle.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

const navLinkMap = {};
navLinksEl.querySelectorAll('a[data-section]').forEach(function(link) {
  navLinkMap[link.getAttribute('data-section')] = link;
});
const sectionIds = Object.keys(navLinkMap);
const sectionObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      sectionIds.forEach(function(id) {
        navLinkMap[id].classList.remove('active');
      });
      navLinkMap[entry.target.id].classList.add('active');
    }
  });
}, { threshold: 0.4 });
sectionIds.forEach(function(id) {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function() {
        entry.target.classList.add('in');
      }, i * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(function(el) { revealObserver.observe(el); });

document.querySelectorAll('.galleryGrid .card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const frame = card.querySelector('.photoFrame');
    frame.style.transform = 'rotateX(' + (py * -8) + 'deg) rotateY(' + (px * 8) + 'deg) scale(1.02)';
  });
  card.addEventListener('mouseleave', function() {
    card.querySelector('.photoFrame').style.transform = 'rotateX(0) rotateY(0) scale(1)';
  });
});

document.getElementById('scrollCta').addEventListener('click', function() {
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
});

document.querySelectorAll('.photoFrame').forEach(function(frame) {
  const src = frame.getAttribute('data-src');
  if (!src) return;
  frame.classList.add('loading');
  const img = new Image();
  img.className = 'photoFill';
  img.alt = frame.getAttribute('data-alt') || '';
  img.onload = function() {
    frame.innerHTML = '';
    frame.appendChild(img);
    frame.classList.remove('loading');
  };
  img.onerror = function() {
    frame.classList.remove('loading');
  };
  img.src = src;
});

const verseTrack = document.getElementById('verseTrack');
const verseDots = document.querySelectorAll('#verseDots span');
const verseCount = document.querySelectorAll('.verseCard').length;

function setActiveVerseDot(index) {
  verseDots.forEach(function(dot, i) {
    dot.classList.toggle('active', i === index);
  });
}

function scrollToVerse(index) {
  const clamped = Math.max(0, Math.min(verseCount - 1, index));
  const card = verseTrack.children[clamped];
  verseTrack.scrollTo({ left: card.offsetLeft - verseTrack.offsetLeft, behavior: 'smooth' });
  setActiveVerseDot(clamped);
}

let currentVerse = 0;
document.getElementById('verseArrowLeft').addEventListener('click', function() {
  currentVerse = Math.max(0, currentVerse - 1);
  scrollToVerse(currentVerse);
});
document.getElementById('verseArrowRight').addEventListener('click', function() {
  currentVerse = Math.min(verseCount - 1, currentVerse + 1);
  scrollToVerse(currentVerse);
});

let verseScrollTimeout;
verseTrack.addEventListener('scroll', function() {
  clearTimeout(verseScrollTimeout);
  verseScrollTimeout = setTimeout(function() {
    const cardWidth = verseTrack.children[0].offsetWidth + 24;
    const index = Math.round(verseTrack.scrollLeft / cardWidth);
    currentVerse = Math.max(0, Math.min(verseCount - 1, index));
    setActiveVerseDot(currentVerse);
  }, 100);
});

document.querySelectorAll('.tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
  });
});

function extractSpotifyId(value) {
  const match = value.match(/track\/([a-zA-Z0-9]+)/);
  return match ? match[1] : value;
}

const spotifyPanel = document.getElementById('spotifyPanel');
let openTrack = null;
document.querySelectorAll('.track').forEach(function(track) {
  track.addEventListener('click', function() {
    document.querySelectorAll('.track').forEach(function(t) { t.classList.remove('playing'); });
    const spotifyValue = track.getAttribute('data-spotify');
    if (openTrack === track) {
      spotifyPanel.innerHTML = '';
      openTrack = null;
      return;
    }
    track.classList.add('playing');
    openTrack = track;
    if (!spotifyValue) {
      spotifyPanel.innerHTML = '<div class="spotifyHint">Add this song\'s Spotify link to data-spotify on this track to play it here.</div>';
      return;
    }
    const trackId = extractSpotifyId(spotifyValue);
    const openUrl = 'https://open.spotify.com/track/' + trackId;
    spotifyPanel.innerHTML = '<iframe src="https://open.spotify.com/embed/track/' + trackId + '" height="152" allow="encrypted-media"></iframe>' +
      '<a class="spotifyOpenLink" href="' + openUrl + '" target="_blank" rel="noopener">Play on Spotify &#8594;</a>';
  });
});

document.addEventListener('click', function(e) {
  if (!openTrack) return;
  if (e.target.closest('.track') || e.target.closest('.spotifyPanel')) return;
  document.querySelectorAll('.track').forEach(function(t) { t.classList.remove('playing'); });
  spotifyPanel.innerHTML = '';
  openTrack = null;
});



const videoModal = document.getElementById('videoModal');
const videoModalPlayer = document.getElementById('videoModalPlayer');
const videoModalLabel = document.getElementById('videoModalLabel');
const videoModalBackdrop = document.getElementById('videoModalBackdrop');
const videoModalClose = document.getElementById('videoModalClose');
const videoModalBox = document.getElementById('videoModalBox');
const videoArrowLeft = document.getElementById('videoArrowLeft');
const videoArrowRight = document.getElementById('videoArrowRight');

document.querySelectorAll('.phoneMockup').forEach(function(phone) {
  const thumb = phone.querySelector('.phoneThumb');
  const placeholder = phone.querySelector('.phoneThumbPlaceholder');
  const src = phone.getAttribute('data-video');
  if (!thumb || !src) return;
  thumb.src = src;
  function stopPulse() {
    if (placeholder) placeholder.classList.remove('loading');
  }
  thumb.addEventListener('loadeddata', function() {
    thumb.currentTime = 0.1;
    if (placeholder) placeholder.classList.add('hide');
    stopPulse();
  });
  thumb.addEventListener('error', stopPulse);
  setTimeout(stopPulse, 4000);
});

const videoItems = Array.from(document.querySelectorAll('.phoneMockup')).map(function(phone) {
  return { src: phone.getAttribute('data-video'), label: phone.getAttribute('data-label') };
});
let currentVideoIndex = 0;

function showVideo(index) {
  currentVideoIndex = (index + videoItems.length) % videoItems.length;
  const item = videoItems[currentVideoIndex];
  videoModalPlayer.src = item.src;
  videoModalLabel.textContent = item.label || '';
  videoModalPlayer.play();
}

function openVideoModal(index) {
  videoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  showVideo(index);
}

function closeVideoModal() {
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute('src');
  videoModalPlayer.load();
  videoModal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.phoneMockup').forEach(function(phone, index) {
  phone.addEventListener('click', function() {
    openVideoModal(index);
  });
});

videoModalBackdrop.addEventListener('click', closeVideoModal);
videoModalClose.addEventListener('click', closeVideoModal);
videoArrowLeft.addEventListener('click', function() { showVideo(currentVideoIndex - 1); });
videoArrowRight.addEventListener('click', function() { showVideo(currentVideoIndex + 1); });

document.addEventListener('keydown', function(e) {
  if (!videoModal.classList.contains('open')) return;
  if (e.key === 'Escape') closeVideoModal();
  if (e.key === 'ArrowLeft') showVideo(currentVideoIndex - 1);
  if (e.key === 'ArrowRight') showVideo(currentVideoIndex + 1);
});

function addSwipeNavigation(element, onPrev, onNext) {
  let touchStartX = 0;
  element.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  });
  element.addEventListener('touchend', function(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) onPrev(); else onNext();
  });
}

addSwipeNavigation(videoModalBox, function() { showVideo(currentVideoIndex - 1); }, function() { showVideo(currentVideoIndex + 1); });

const lightbox = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxBox = document.getElementById('lightboxBox');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxArrowLeft = document.getElementById('lightboxArrowLeft');
const lightboxArrowRight = document.getElementById('lightboxArrowRight');

const galleryItems = Array.from(document.querySelectorAll('.galleryGrid .card')).map(function(card) {
  return {
    src: card.querySelector('.photoFrame').getAttribute('data-src'),
    caption: card.querySelector('figcaption') ? card.querySelector('figcaption').textContent : ''
  };
});
let currentPhotoIndex = 0;

function showPhoto(index) {
  currentPhotoIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentPhotoIndex];
  lightboxImage.src = item.src;
  lightboxCaption.textContent = item.caption;
}

function openLightbox(index) {
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  showPhoto(index);
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.galleryGrid .card').forEach(function(card, index) {
  card.style.cursor = 'pointer';
  card.addEventListener('click', function() {
    openLightbox(index);
  });
});

lightboxBackdrop.addEventListener('click', closeLightbox);
lightboxClose.addEventListener('click', closeLightbox);
lightboxArrowLeft.addEventListener('click', function() { showPhoto(currentPhotoIndex - 1); });
lightboxArrowRight.addEventListener('click', function() { showPhoto(currentPhotoIndex + 1); });

document.addEventListener('keydown', function(e) {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
});

addSwipeNavigation(lightboxBox, function() { showPhoto(currentPhotoIndex - 1); }, function() { showPhoto(currentPhotoIndex + 1); });

const wishForm = document.getElementById('wishForm');
const wishSuccess = document.getElementById('wishSuccess');
const wishErrorForm = document.getElementById('wishErrorForm');
wishForm.addEventListener('submit', function(e) {
  e.preventDefault();
  wishErrorForm.hidden = true;
  const formData = new FormData(wishForm);
  fetch(wishForm.action, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' }
  }).then(function(response) {
    if (response.ok) {
      wishForm.reset();
      wishForm.hidden = true;
      wishSuccess.hidden = false;
    } else {
      wishErrorForm.hidden = false;
    }
  }).catch(function() {
    wishErrorForm.hidden = false;
  });
});