import Error from 'next/error'

const PlaylistNotFound = () => {
    return <Error statusCode={404} />
}

export default PlaylistNotFound
