const API_URL = "http://localhost:3333" ;
const getsessionToken = () => localStorage.getItem('session_token');

//User management 
export const createUser = async (userData)=>{

    const response = await fetch(`${API_URL}/users`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'            
        },
        body: JSON.stringify(userData),
    })
    if(response.status === 400) throw new Error()
    if(!response.ok) throw new Error(response.json);
    return;
}

export const loginUser = async (userData)=>{

    const response = await fetch(`${API_URL}/login`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'            
        },
        body: JSON.stringify(userData),
    })
    return response.json();
    
}

export const logOutUser = async ()=>{
    const token = getsessionToken();
    const response = await fetch(`${API_URL}/logout`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,
        },
    })

    if(!response.ok) throw new Error(response.status);
    return;
}



//Event management
export const createEvent = async (eventDetails)=>{
    const token = getsessionToken();
    const response = await fetch(`${API_URL}/events`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,
        },
        body: JSON.stringify(eventDetails),
    })
    if(response.status === 400) throw new Error(response.json);
    else if(!response.ok) throw new Error(response.status);
    else return;
}

export const getEvent = async (event_id)=>{
    const token = getsessionToken();
    const response = await fetch(`${API_URL}/event/${event_id}`,{
            method: 'GET',
            "X-Authorization": token,   
        })
    if(!response.ok) throw new Error(response.status);
    return response.json();
}
export const updateEvent = async (event_id,updateDetails)=>{
    const token = getsessionToken();
    const response = await fetch(`${API_URL}/event/${event_id}`,{
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,
        },  
        body: JSON.stringify(updateDetails),
    })
    if(response.status === 400) throw new Error(response.json());
    if(!response.ok) throw new Error(response.status);
    else return;
}

export const registerEvent = async (event_id)=>{
    const token = getsessionToken();
    const response = await fetch(`${API_URL}/event/${event_id}`,{
           method: 'POST',
           headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,
            }
    })
    if (!response.ok) 
    {
        const errorMessage = await response.json(); // Parse JSON body for error details
        throw new Error(errorMessage || response.status); // Use a fallback message if `error` field is missing
    }
    return ;
}

export const deleteEvent = async (event_id)=>{
    const token = getsessionToken();

    const response = await fetch(`${API_URL}/event/${event_id}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token
        }
    })
    if(!response.ok) throw new Error(response.status);    
    return ;
}





//Question management
export const askQuestion = async (event_id,question)=>{
    const token = getsessionToken();
    
    const response = await fetch(`${API_URL}/event/${event_id}/question`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,          
        },
        body: JSON.stringify(question),
    })
    if(!response.ok) throw new Error(response.status);
    return ;
}

export const deleteQuestion = async (question_id)=>{
    const token = getsessionToken();
    
    const response = await fetch(`${API_URL}/event/${question_id}`,{

        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,          
        },
    })
    if(!response.ok) throw new Error(response.status);
    return;
}

export const upVoteQuestion = async (question_id)=>{
    const token = getsessionToken();
    
    const response = await fetch(`${API_URL}/question/${question_id}/vote`,{

        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,          
        },
    })
    if(!response.ok) throw new Error(response.status);
    return ;
}

export const downVoteQuestion = async (question_id)=>{
    const token = getsessionToken();
    
    const response = await fetch(`${API_URL}/question/${question_id}/vote`,{

        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            "X-Authorization": token,          
        },
    })
    if(!response.ok) throw new Error(response.status);
    return ;
}

