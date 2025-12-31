import React, {useEffect, useState} from 'react'
import { useSelector } from 'react-redux'
import appwriteService from "../appwrite/config";
import {Container, PostCard} from '../components'
import { useNavigate } from 'react-router-dom';

function Home() {
    const [posts, setPosts] = useState([])
    const [fetchError, setFetchError] = useState(null)
    const authStatus = useSelector(state => state.auth.status)
    const navigate = useNavigate();
    const loginOnclick = () =>{
        navigate('/login')
    }

   useEffect(() => {
    if (authStatus) {
        appwriteService.getPosts().then((res) => {
            if (res?.documents) setPosts(res.documents)
            else setPosts([])
        })
    }
}, [authStatus])

  
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            {authStatus === false ? (
                                <h1 className="text-2xl font-bold hover:text-gray-500" onClick={loginOnclick}>
                                    Login to read posts
                                </h1>
                            ) : (
                                <h1 className="text-2xl font-bold hover:text-gray-500" onClick={loginOnclick}>
                                    No posts to show
                                </h1>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
  <div className="w-full py-8 mt-4 text-center">
    <Container>

      {!authStatus && (
        <h1
          className="text-2xl font-bold hover:text-gray-500 cursor-pointer"
          onClick={loginOnclick}
        >
          Login to read posts
        </h1>
      )}

      {authStatus && posts.length === 0 && (
        <h1 className="text-2xl font-bold">
          No posts to show
        </h1>
      )}

      {authStatus && posts.length > 0 && (
        <div className="flex flex-wrap">
          {posts.map((post) => (
            <div key={post.$id} className="p-2 w-1/4">
              <PostCard {...post} />
            </div>
          ))}
        </div>
      )}

    </Container>
  </div>
)

}

export default Home