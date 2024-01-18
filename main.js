const searchInput = document.getElementById('search')
const images = []
const authKey = 'yGouJIjA7ucIWgU0ldCFztPdvbY1tMMYPV5ALVEFfJnLqJNFRPqVxlVB' //please do not use this key in your code request it here https://www.pexels.com/api/new/ it's FREE!
const imagesContainer = document.getElementById('images')
let timeLastChange = new Date()
const searchDelay = 500
const emptyBtn = document.getElementById('emptyBtn')
let currentSearch = ''
let currentPage = 1
let totalPages = 1
const pagination = document.getElementById('pagination')

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

const changePage = element => {
	const page = element.id.split('-')[1]
	let targetEl = element
	prevLi = document.querySelector('.page-item:has(#pagination-prev)')
	nextLi = document.querySelector('.page-item:has(#pagination-next)')

	if (page === 'prev') {
		currentPage = currentPage - 1
		targetEl = document.getElementById('pagination-' + currentPage)
	} else if (page === 'next') {
		currentPage = currentPage + 1
		targetEl = document.getElementById('pagination-' + currentPage)
	} else {
		currentPage = parseInt(page)
	}

	if (currentPage === 1) {
		prevLi.classList.add('disabled')
	} else {
		prevLi.classList.remove('disabled')
	}
	if (currentPage === totalPages) {
		nextLi.classList.add('disabled')
	} else {
		nextLi.classList.remove('disabled')
	}

	const selectedLi = document.querySelector('.page-item.active')
	selectedLi.classList.remove('active')
	targetEl.closest('.page-item').classList.add('active')
	search(currentSearch, currentPage)
}

const createPagination = () => {
	totalPages = totalPages || 1
	pagination.innerHTML = ''
	if (totalPages <= 1) {
		return
	}
	const prevLi = document.createElement('li')
	prevLi.classList.add('page-item')
	for (let i = 0; i <= totalPages + 1; i++) {
		const li = document.createElement('li')
		li.classList.add('page-item')
		let text = i
		let id = 'pagination-' + i
		if (i === 0) {
			text = '&laquo;'
			li.classList.add('disabled')
			id = 'pagination-prev'
		}
		if (i === 1) {
			li.classList.add('active')
		}
		if (i === totalPages + 1) {
			text = '&raquo;'
			id = 'pagination-next'
			if (totalPages === 1) {
				li.classList.add('disabled')
			}
		}
		li.innerHTML = `<a id="${id}" href="#images" class="page-link" onclick="changePage(this)">${text}</a>`
		pagination.appendChild(li)
	}
}

const search = (query = '', page) => {
	const sameSearch = query === currentSearch
	currentSearch = query
	images.length = 0
	imagesContainer.innerHTML = `<div class="spinner-border" role="status">
  <span class="visually-hidden">Loading...</span>
</div>`
	fetch(
		`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=9&page=${page}`,
		{
			headers: {
				Authorization: authKey,
			},
		}
	)
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
			totalPages = Math.ceil(data.total_results / 9)
			if (!sameSearch) {
				createPagination()
			}
		})
		.catch(error => console.log(error))
}

const emptySearch = () => {
	searchInput.value = ''
	imagesContainer.innerHTML = '<h3>No results found</h3>'
	emptyBtn.style.display = 'none'
	pagination.innerHTML = ''
}

const displayModal = id => {
	const item = images.find(item => item.id === id)
	const modal = document.getElementById('modal')
	modal.querySelector('.modal-title').innerText = item.alt
	modal.querySelector('.modal-body').innerHTML = `
	<img src="${item.src.original}" width="${item.width}" height="${item.height}" class="img-fluid" alt="${item.alt}"  />
	<p class="bg-light">Photo by: <a href="${item.photographer_url}" target="_blank" rel="nofollow noopener">${item.photographer}</a></p>
	`
	modal.querySelector('.modal-body').style.backgroundColor = item.avg_color
	new bootstrap.Modal(modal).show()
}

searchInput.addEventListener('keyup', () => {
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
