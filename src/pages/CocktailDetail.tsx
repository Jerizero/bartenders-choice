import { useParams } from 'react-router-dom'

export default function CocktailDetail() {
  const { slug } = useParams()
  return (
    <div className="p-4">
      <h1 className="text-2xl text-gold tracking-widest uppercase text-center py-8 font-sans">
        {slug}
      </h1>
    </div>
  )
}
