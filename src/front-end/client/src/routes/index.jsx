import { createBrowserRouter, RouterProvider } from 'react-router'
import Default from '@/routes/Layouts/Default.jsx'
import Home from '@/routes/pages/Home.jsx'
import About from '@/routes/pages/About.jsx'
import Todos from '@/routes/pages/Todos.jsx'
import Movies from '@/routes/pages/Movies.jsx'
import SignIn from '@/routes/pages/SignIn.jsx'
import NotFound from '@/routes/pages//NotFound.jsx'

const router = createBrowserRouter([
  {
    element: <Default />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/signin',
        element: <SignIn />
      },
      {
        path: '/todos',
        element: <Todos />
      },
      {
        path: '/movies',
        element: <Movies />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
])

export default function Router() {
  return <RouterProvider router={router} />
}
