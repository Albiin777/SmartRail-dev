const { supabase, supabaseAdmin } = require('../config/supabase');

const createComplaint = async (req, res) => {
    try {
        const { subject, description, images } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data, error } = await supabaseAdmin
            .from('complaints')
            .insert({ user_id: user.id, subject, description, images: images || [], status: 'open' })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ complaint: data });
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
};

const getReplies = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data: complaint, error: complaintError } = await supabaseAdmin
            .from('complaints').select('id, user_id').eq('id', complaintId).eq('user_id', user.id).single();

        if (complaintError || !complaint) return res.status(404).json({ error: 'Complaint not found or access denied' });

        const { data: replies, error: repliesError } = await supabaseAdmin
            .from('complaint_replies').select('*').eq('complaint_id', complaintId).order('created_at', { ascending: true });

        if (repliesError) return res.status(500).json({ error: 'Failed to fetch replies' });
        res.json({ replies: replies || [] });
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const addReply = async (req, res) => {
    try {
        const { complaintId } = req.params;
        const { message, marks_resolved } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
        if (!message || message.trim().length === 0) return res.status(400).json({ error: 'Message is required' });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data: complaint, error: complaintError } = await supabaseAdmin
            .from('complaints').select('id, user_id, status').eq('id', complaintId).eq('user_id', user.id).single();

        if (complaintError || !complaint) return res.status(404).json({ error: 'Complaint not found or access denied' });
        if (complaint.status === 'closed') return res.status(400).json({ error: 'Cannot reply to closed complaints' });

        const replyData = {
            complaint_id: complaintId, user_id: user.id,
            message: message.trim(), is_admin_reply: false, marks_resolved: false,
        };

        const { data: newReply, error: insertError } = await supabaseAdmin
            .from('complaint_replies').insert(replyData).select().single();

        if (insertError) return res.status(500).json({ error: 'Failed to create reply', details: insertError.message });

        if (marks_resolved) {
            await supabaseAdmin.from('complaint_replies').update({ marks_resolved: true }).eq('id', newReply.id);
            await supabaseAdmin.from('complaints').update({ status: 'resolved' }).eq('id', complaintId);
            newReply.marks_resolved = true;
        }

        res.status(201).json({ reply: newReply });
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = {
    createComplaint,
    getReplies,
    addReply
};
