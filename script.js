
/* Defoundje Shop JS - cart + checkout + order tracking (localStorage-based) */
function getCart(){return JSON.parse(localStorage.getItem('dfj_cart')||'[]')}
function saveCart(c){localStorage.setItem('dfj_cart',JSON.stringify(c))}
function addToCart(id,name,price,img){let c=getCart();let it=c.find(x=>x.id===id);if(it){it.qty++}else{c.push({id,name,price,qty:1,img})}saveCart(c);toast(name+' ditambahkan ke keranjang')}
function toast(msg){let t=document.createElement('div');t.textContent=msg;t.style.position='fixed';t.style.right='20px';t.style.bottom='20px';t.style.background='#111';t.style.color='#fff';t.style.padding='10px 14px';t.style.borderRadius='8px';t.style.zIndex=9999;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}

/* render cart table */
function renderCart(){let c=getCart();let tbody=document.querySelector('#cart-body');if(!tbody)return;tbody.innerHTML='';let total=0;c.forEach((it,idx)=>{let sub=it.price*it.qty;total+=sub;tbody.insertAdjacentHTML('beforeend',`<tr><td><div style="display:flex;gap:12px;align-items:center"><img src="${it.img}" style="width:60px;height:50px;object-fit:cover;border-radius:6px"/><div><strong>${it.name}</strong><div class="meta">Rp${it.price.toLocaleString()}</div></div></div></td><td class="qty"><button onclick="changeQty(${idx},-1)">−</button> ${it.qty} <button onclick="changeQty(${idx},1)">+</button></td><td>Rp${sub.toLocaleString()}</td><td><button onclick="removeItem(${idx})" class="btn secondary">Hapus</button></td></tr>`)});document.getElementById('cart-total').textContent='Rp'+total.toLocaleString();}
function changeQty(i,delta){let c=getCart();c[i].qty=Math.max(1,c[i].qty+delta);saveCart(c);renderCart()}
function removeItem(i){let c=getCart();c.splice(i,1);saveCart(c);renderCart()}

/* Checkout -> create order */
function handleCheckout(e){e.preventDefault();let name=document.getElementById('cf-name').value.trim();let email=document.getElementById('cf-email').value.trim();let addr=document.getElementById('cf-address').value.trim();if(!name||!email||!addr){alert('Lengkapi data checkout');return;}let cart=getCart();if(cart.length===0){alert('Keranjang kosong');return;}let total=cart.reduce((s,i)=>s+i.price*i.qty,0);let id='DFJ'+Date.now().toString().slice(-6);let order={id,customer:{name,email,addr},items:cart,total,status:0,created:Date.now()};let orders=JSON.parse(localStorage.getItem('dfj_orders')||'[]');orders.unshift(order);localStorage.setItem('dfj_orders',JSON.stringify(orders));localStorage.removeItem('dfj_cart');localStorage.setItem('dfj_current_order',id);window.location='payment.html'}

/* payment: simulate paid -> start status progression */
function markPaid(){let id=localStorage.getItem('dfj_current_order');if(!id){alert('Tidak ada order aktif');return}let orders=JSON.parse(localStorage.getItem('dfj_orders')||'[]');for(let o of orders){if(o.id===id){o.status=1;localStorage.setItem('dfj_orders',JSON.stringify(orders));localStorage.setItem('dfj_current_order',id);window.location='order.html';return}}alert('Order tidak ditemukan')}

/* Order page: show status and auto-progress */
function renderOrder(){let id=localStorage.getItem('dfj_current_order');if(!id)return;let orders=JSON.parse(localStorage.getItem('dfj_orders')||'[]');let order=orders.find(o=>o.id===id);if(!order)return;document.getElementById('order-id').textContent=order.id;document.getElementById('order-customer').textContent=order.customer.name;document.getElementById('order-total').textContent='Rp'+order.total.toLocaleString();let steps=['Menunggu Pembayaran','Pembayaran Diverifikasi','Pesanan Diproses','Pesanan Dikirim','Selesai'];let tracker=document.getElementById('tracker');tracker.innerHTML='';steps.forEach((s,idx)=>{let act=idx<=order.status? 'active':'';tracker.insertAdjacentHTML('beforeend',`<div class="step"><div class="bullet ${act}">${idx+1}</div><div style="margin-top:8px;color:${act? 'var(--text)':'var(--muted)'}">${s}</div></div>`);if(idx<steps.length-1){tracker.insertAdjacentHTML('beforeend',`<div class="line ${idx<order.status? 'active':''}"></div>`)} });}

/* progress tick: every 5s advance status until finished */
function startProgression(){let id=localStorage.getItem('dfj_current_order');if(!id)return;let interval= setInterval(()=>{let orders=JSON.parse(localStorage.getItem('dfj_orders')||'[]');let idx=orders.findIndex(o=>o.id===id);if(idx===-1){clearInterval(interval);return}let o=orders[idx];if(o.status<4){o.status++;orders[idx]=o;localStorage.setItem('dfj_orders',JSON.stringify(orders));renderOrder();} else {clearInterval(interval);} },5000);}

/* Orders list (history) */
function renderOrdersList(){let orders=JSON.parse(localStorage.getItem('dfj_orders')||'[]');let wrap=document.getElementById('orders-list');if(!wrap)return;wrap.innerHTML='';orders.forEach(o=>{wrap.insertAdjacentHTML('beforeend',`<div class="order-card"><div><strong>${o.id}</strong><div class="meta">${new Date(o.created).toLocaleString()} • ${o.customer.name}</div></div><div><div style="font-weight:700">Rp${o.total.toLocaleString()}</div><div class="meta">${['Menunggu','Diverifikasi','Diproses','Dikirim','Selesai'][o.status]}</div><a class="btn" href="order.html" onclick="localStorage.setItem('dfj_current_order','${o.id}')">Lihat</a></div></div>`)} )}

/* small initializer */
window.addEventListener('load',()=>{ if(document.querySelector('#cart-body')) renderCart(); if(document.getElementById('checkout-form')){document.getElementById('checkout-form').addEventListener('submit',handleCheckout)} if(document.getElementById('btn-paid')) document.getElementById('btn-paid').addEventListener('click',markPaid); if(document.getElementById('order-id')){renderOrder(); startProgression()} if(document.getElementById('orders-list')) renderOrdersList(); })
