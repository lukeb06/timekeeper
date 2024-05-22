const API_PORT = 3001;
const API_URL = `${window.location.protocol}//${window.location.hostname}:${API_PORT}/`;
const endpoint = (path) => `${API_URL}${path}`;

const fetcher = async (path, options={}, textMode=false) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(endpoint(path), options);
            const data = textMode ? await response.text() : await response.json();
            resolve(data);
        } catch (e) {
            reject(e);
        }
    });
}

export default fetcher;