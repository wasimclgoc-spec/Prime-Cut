const fetchImages = async () => {
  try {
    const res = await fetch('https://www.themeathub.com/');
    const text = await res.text();
    const imgRegex = /src="([^"]+)"/g;
    let match;
    const urls = new Set();
    while ((match = imgRegex.exec(text)) !== null) {
      if (match[1].includes('.jpg') || match[1].includes('.png') || match[1].includes('.webp')) {
        urls.add(match[1]);
      }
    }
    console.log(Array.from(urls).join('\n'));
  } catch (e) {
    console.error(e);
  }
};
fetchImages();