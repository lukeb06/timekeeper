const breakpoint = str => {
    if (str === 'sm' && window.innerWidth >= 640) return true;
    if (str === 'md' && window.innerWidth >= 768) return true;
    if (str === 'lg' && window.innerWidth >= 1024) return true;
    if (str === 'xl' && window.innerWidth >= 1280) return true;
    if (str === '2xl' && window.innerWidth >= 1536) return true;
    
    return false;
}

export default breakpoint;