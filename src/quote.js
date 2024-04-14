

class Quote {
  constructor(user, content) {
    this.content = content;
    this.author = user;
    let id = user.id;
    /* 0xFF FF FF FFF  */
    /*   a  b  c  d    */
    /* 
     a = Sum of digits of user id
     b = random integer between 0 - 255
     c = last two digits of user id
     d = time in ms % 0xFFF
    */
    let a = sumDigits(id);
    if (a > 0xFF) {
      a = sumDigits(a);
    };

    let b = Math.floor(Math.random() * 0xFF);
    let c = id.toString().slice(-2);
    let d = Date.now() % (0xFFF + 1);
    this.id = a.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0') + c.toString(16).padStart(2, '0') + d.toString(16).padStart(3, '0');
  }
}

function sumDigits(n) {
  return n.toString().split('').reduce((a, b) => a + parseInt(b), 0);
}

module.exports = { Quote };