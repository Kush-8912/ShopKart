// Product categories, in the order the filters and the home page show them
export const CATEGORIES = ['Electronics', 'Fashion', 'Books', 'Home']

// Book covers are portrait: show the whole cover instead of cropping it into the 4:3 frame
export const imageFit = (product) => (product.category === 'Books' ? 'object-contain p-3' : 'object-cover')
