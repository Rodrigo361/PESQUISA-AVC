const url = 'https://script.google.com/macros/s/AKfycbxEMWqNHIlyRVCPacbVBLHv5zEOFarTPIobqWdBtDDY-pOn7oEvH-NdkQl-uGkBoveqJQ/exec';

async function test() {
  try {
    const res = await fetch(url + '?action=read');
    const text = await res.text();
    console.log('GET result:', text.substring(0, 100));
  } catch (e) {
    console.error('GET error:', e);
  }
}
test();
