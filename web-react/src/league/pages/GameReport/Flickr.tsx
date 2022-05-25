import 'photoswipe/dist/photoswipe.css'
import React, { useEffect, useState } from 'react'
import { Gallery, Item } from 'react-photoswipe-gallery'

const getFlickrAlbum = async (albumId: string, cb: () => void) => {
  const url = `https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=${process.env.REACT_APP_FLICKR_API_KEY}&photoset_id=${albumId}&format=json&nojsoncallback=1&extras=url_o`
  const data = await fetch(url)
    .then(res => res.json())
    .then(data =>
      data.photoset.photo.map((photo: any) => ({
        ...photo,
        src: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
        thumbnail: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_q.jpg`,
      }))
    )
    .catch(err => console.log(err))
    .finally(cb)

  return data || []
}

type Props = {
  albumId: string
}

const getAlbumId = (url: string) => {
  const regex =
    /https:\/\/www.flickr.com\/photos\/[^\\/]+\/(albums|sets)\/([^\\/]+)/
  const match = url.match(regex)
  return match ? match[2] : url
}

const FlickrGallery = ({ albumId }: Props) => {
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const albumIdFromUrl = getAlbumId(albumId)
    const fetchPhotos = async () => {
      setLoading(true)
      setError(false)

      const data = await getFlickrAlbum(albumIdFromUrl, () => {
        setLoading(false)
      })

      setPhotos(data)
    }
    albumIdFromUrl && fetchPhotos()
  }, [albumId])

  return (
    <>
      <h2>Game gallery</h2>
      {loading && <div>Loading...</div>}
      {error && <div>Error...</div>}
      {photos.length === 0 && !loading && !error && <div>No photos</div>}
      <Gallery
        options={{
          spacing: 10,
          loop: true,
          pinchToClose: true,
          showAnimationDuration: 5,
          easing: 'cubic-bezier(.4,0,.22,1)',
          escKey: true,
          arrowKeys: true,
          preload: [2, 4],
          counter: true,
        }}
      >
        <div
          style={{
            justifyContent: 'center',
            display: 'grid',
            gridTemplateColumns: 'repeat( auto-fit, minmax(200px, 1fr)',
            gridGap: 10,
          }}
        >
          {photos.map((photo: any) => (
            <Item
              key={photo.id}
              original={photo.src}
              thumbnail={photo.thumbnail}
              alt={photo.title}
              width={photo.width_o}
              height={photo.height_o}
            >
              {({ ref, open }) => (
                <img
                  style={{
                    cursor: 'pointer',
                    objectFit: 'cover',
                    width: '200px',
                    height: '150px',
                  }}
                  ref={ref as React.MutableRefObject<HTMLImageElement>}
                  onClick={open}
                  src={photo.src}
                />
              )}
            </Item>
          ))}
        </div>
      </Gallery>
    </>
  )
}

export { FlickrGallery }
