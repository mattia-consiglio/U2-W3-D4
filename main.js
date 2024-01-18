const searchInput = document.getElementById('search')
const images = []
const authKey = 'yGouJIjA7ucIWgU0ldCFztPdvbY1tMMYPV5ALVEFfJnLqJNFRPqVxlVB' //please do not use this key in your code request it here https://www.pexels.com/api/new/ it's FREE!
const imagesContainer = document.getElementById('images')
let timeLastChange = new Date()
const searchDelay = 500
const emptyBtn = document.getElementById('emptyBtn')

const createCard = item => {
	const col = document.createElement('div')
	col.classList.add('col-md-4')
	// file deepcode ignore DOMXSS: It't a test project
	col.innerHTML = `
	<div class="card mb-4 shadow-sm h-100">
              <img src="${item.src.medium}" class="bd-placeholder-img card-img-top img-fluid" width="${item.width}" height="${item.height}" onclick="displayModal(${item.id})"  alt="${item.alt}"style="background-color: ${item.avg_color}" />
              <div class="card-body d-flex flex-column">
                <div class="flex-grow-1">
									<h5 class="card-title" onclick="displayModal(${item.id})">${item.alt}</h5>
									<p class="card-text">
										Photo by: <a href="${item.photographer_url}" target="_blank" rel="nofollow noopener">${item.photographer}</a>
									</p>
								</div>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="displayModal(${item.id})">
                      View
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" onclick="hideCard(this)">
                      Hide
                    </button>
                  </div>
                  <small class="text-muted">${item.id}</small>
                </div>
              </div>
            </div>`
	imagesContainer.appendChild(col)
}

const hideCard = element => {
	element.closest('.col-md-4').remove()
}

const createCards = items => {
	imagesContainer.innerHTML = ''
	if (items.length === 0) {
		imagesContainer.innerHTML = '<h3>No results found</h3>'
	}
	items.forEach(item => {
		createCard(item)
	})
}

const search = query => {
	images.length = 0
	imagesContainer.innerHTML = `<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
	fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9`, {
		headers: {
			Authorization: authKey,
		},
	})
		.then(response => {
			if (!response.ok) {
				throw Error(response.statusText)
			}
			return response.json()
		})
		.then(data => {
			if (data.errors) {
				console.log(data.errors)
				return
			}
			images.push(...data.photos)
			createCards(images)
		})
		.catch(error => console.log(error))
}

const emptySearch = () => {
	searchInput.value = ''
	imagesContainer.innerHTML = '<h3>No results found</h3>'
	emptyBtn.style.display = 'none'
}

const displayModal = id => {
	const item = images.find(item => item.id === id)
	const modal = document.getElementById('modal')
	modal.querySelector('.modal-title').innerText = item.alt
	modal.querySelector('.modal-body').innerHTML = `
	<img src="${item.src.large}" class="img-fluid" alt="${item.alt} />
	<p class="bg-light">Photo by: <a href="${item.photographer_url}" target="_blank" rel="nofollow noopener">${item.photographer}</a></p>
	`
	modal.querySelector('.modal-body').style.backgroundColor = item.avg_color
	new bootstrap.Modal(modal).show()
}

searchInput.addEventListener('keyup', event => {
	console.log(emptyBtn)
	if (searchInput.value.trim().length < 1) {
		emptyBtn.style.display = 'none'
		emptySearch()
		return
	}
	emptyBtn.style.display = 'block'
	imagesContainer.innerHTML = `<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
	timeLastChange = new Date()
	setTimeout(() => {
		if (new Date() - timeLastChange < searchDelay) {
			return
		}
		search(searchInput.value.trim())
	}, searchDelay)
})
