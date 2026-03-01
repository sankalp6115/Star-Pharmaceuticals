<h1>Star Pharma CRM</h1>

<h3>Offline Field Sales Management Application</h3>

<p>
Star Pharma CRM is a mobile-first offline CRM system built specifically for pharmaceutical field sales workflows.
It is designed for single-user usage, prioritizing reliability, simplicity, and data safety.
</p>

<hr>

<h2>Project Overview</h2>

<p>
This application manages products, visual aids, slideshows, orders, doctors, and quick notes
in a fully offline environment using IndexedDB via Dexie.js.
</p>

<p>
The web application is deployed as an Android application using Capacitor and built inside Android Studio.
</p>

<hr>

<h2>Core Features</h2>

<h3>Products</h3>
<ul>
<li>Add, edit, and delete products</li>
<li>Store category, price, type, and description</li>
<li>Image support with compression</li>
<li>Link products with visual aids</li>
</ul>

<h3>Visual Aids</h3>
<ul>
<li>Store promotional visuals</li>
<li>Select multiple visuals</li>
<li>Highlight selected visuals</li>
<li>Link visuals to slideshows</li>
</ul>

<h3>Slideshows</h3>
<ul>
<li>Create slideshow from selected visuals</li>
<li>Fullscreen presentation mode</li>
<li>Smooth image transitions</li>
<li>Manual navigation (Next / Previous)</li>
<li>Slide title display</li>
</ul>

<h3>Orders</h3>
<ul>
<li>Create new order entries</li>
<li>Store customer name, phone, address</li>
<li>Goods entry with textarea support</li>
<li>Mark order as delivered</li>
<li>Automatic timestamp tracking</li>
<li>Separate active and history view</li>
</ul>

<h3>Doctors</h3>
<ul>
<li>Store doctor details</li>
<li>Name, phone, area</li>
<li>Timestamp tracking</li>
<li>Remarks field</li>
</ul>

<h3>Quick Notes</h3>
<ul>
<li>Lightweight notes system</li>
<li>Auto-save behavior</li>
<li>Persistent storage</li>
</ul>

<h3>Settings</h3>
<ul>
<li>Export complete database to JSON</li>
<li>Import database from JSON</li>
<li>Safe database reset option</li>
<li>Blob to Base64 conversion for image export</li>
</ul>

<hr>

<h2>Architecture</h2>

<h3>Frontend Layer</h3>
<ul>
<li>Vanilla JavaScript (ES Modules)</li>
<li>HTML5</li>
<li>Modular CSS (global + page specific)</li>
<li>Mobile-first design</li>
</ul>

<h3>Database Layer</h3>

<p>
Database powered by Dexie.js (IndexedDB wrapper).
</p>

<pre><code>
db.version(1).stores({
  products: "++id,name,category,price,image,description,visualAid",
  visuals: "++id,name,category,image",
  slideshows: "++id,name,*visualIds",
  orders: "++id,name,phone,address,goods,done,timestamp,deliveryTimestamp",
  notes: "id,text",
  doctors: "++id,name,phone,area,timestamp,remark"
});
</code></pre>

<p>
Images are stored as compressed Blob objects inside IndexedDB.
During export, images are converted to Base64.
During import, Base64 is converted back to Blob.
</p>

<hr>

<h2>Mobile Deployment</h2>

<h3>Capacitor Integration</h3>
<ul>
<li>Web application wrapped using Capacitor</li>
<li>Android platform added via Capacitor CLI</li>
<li>Project opened in Android Studio</li>
<li>APK generated for installation</li>
</ul>

<p>
IndexedDB runs inside the WebView sandbox of the Android app.
All data remains fully offline unless manually exported.
</p>

<hr>

<h2>Technologies Used</h2>

<ul>
<li>Dexie.js</li>
<li>IndexedDB</li>
<li>Vanilla JavaScript</li>
<li>HTML5</li>
<li>CSS3</li>
<li>Fuse.js (search functionality)</li>
<li>Canvas API (image compression)</li>
<li>Capacitor</li>
<li>Android Studio</li>
</ul>

<hr>

<h2>Design Philosophy</h2>

<ul>
<li>Offline-first architecture</li>
<li>No unnecessary frameworks</li>
<li>No backend dependency</li>
<li>Single-user simplicity</li>
<li>Manual cloud backup instead of real-time sync</li>
<li>Low complexity system design</li>
</ul>

<hr>

<h2>Future Development Ideas</h2>

<ul>
<li>UUID-based primary keys</li>
<li>Optional cloud backup automation</li>
<li>Doctor visit tracking system</li>
<li>Analytics dashboard</li>
<li>PIN-based app lock</li>
<li>Product linking inside order creation</li>
</ul>

<hr>

<h2>Author</h2>

<p>
Sankalp<br>
Offline-first CRM built for practical pharmaceutical field management.
</p>

<hr>

<p><a href="https://sankalp6115.github.io/Star-Pharmaceuticals/gallery.html">App Screenshots</a></p>

<p>
License: Private Use / Personal Tool
</p>