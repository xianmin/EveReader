class Storage {
  constructor(id) {
    this.id = id
    this.data = {};
    
    this.init(this.id);
  }

  init(id) {
    let temp = window.localStorage.getItem(id);

    if (temp) {
      this.data = JSON.parse(temp);
    }
  }

  setEbookData(key, value) {
    this.data[key] = value;
    let temp = JSON.stringify(this.data);
    window.localStorage.setItem(this.id, temp);
  }

  getEbookData(key) {
    return this.data[key];
  }
}

export default Storage;
