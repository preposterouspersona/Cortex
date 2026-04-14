import Note from "../models/Notes.js";

export async function getAllNotes(req,res){
    try{
        const notes = await Note.find().sort({createdAt:-1}); // newest first.
        res.status(200).json(notes);
    }
    catch(error){
        console.error("failed to fetch notes");
    }

}

export async function getNotesById(req,res){
    try{
        const idNotes =await Note.findById(req.params.id);
        
        if(!idNotes) return res.status(404).json({message:"Note not found"});
        res.status(200).json(idNotes);
    }
    catch(error){
        console.error("Can't fetch the note.");
        res.status(500).json({message:"internal server error"});
    }
}

export async function createNotes(req,res){
    try{
        const {title,content} = req.body;
        const newNote= new Note({title,content});

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    }
    catch(error){
        console.error("Error in creating note");
        res.status(500).json({message:"Internal server error"});
    }
}

export  async function updateNotes(req,res){
    try{
        const {title,content} = req.body;
        const toUpdate = await Note.findByIdAndUpdate(req.params.id,{title,content},{new:true});
        
        if(!toUpdate) return res.status(400).json({message:"Note not found."});
        res.status(201).json(toUpdate);
    }
    catch(error){
        console.error("Cant update notes");
        res.status(500).json({message:"internal sever error"});
    }
}

export async function deleteNotes(req,res){
    try{
        const toDelete = await Note.findByIdAndDelete(req.params.id);
        if(!toDelete) return res.status(404).json({message:"Not found"});
        res.status(200).json({message:"Note deleted successfully"});
    }
    catch(error){
        console.log("Failed to delete");
        res.status(500).json({message:"internal server error"});
    }
    
}