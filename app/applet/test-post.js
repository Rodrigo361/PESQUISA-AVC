const payload = {
  id: '123',
  headers: ['id', 'name'],
  row: ['123', 'Test']
};
const url = 'https://script.google.com/macros/s/AKfycbxEMWqNHIlyRVCPacbVBLHv5zEOFarTPIobqWdBtDDY-pOn7oEvH-NdkQl-uGkBoveqJQ/exec';

fetch(url + '?action=insert', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain;charset=utf-8',
  },
  body: JSON.stringify(payload),
}).then(res => res.text()).then(console.log).catch(console.error);
